import { jsonrepair } from 'jsonrepair';

/**
 * Extract and parse JSON from AI response text.
 * Handles: markdown code blocks, trailing commas, unclosed brackets, unterminated strings.
 */
export function extractJSON<T = unknown>(text: string): T {
  // Step 1: Try markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : extractBraces(text);

  if (!jsonStr) {
    throw new Error('AI返回的结果中未找到JSON');
  }

  // Step 2: Try direct parse
  try {
    return JSON.parse(jsonStr);
  } catch {
    // Step 3: Repair JSON-like model output and retry
    try {
      return JSON.parse(jsonrepair(jsonStr));
    } catch {
      // Continue to local fixer below.
    }

    // Step 4: Fix common issues and retry
    const fixed = fixJSON(jsonStr);
    try {
      return JSON.parse(fixed);
    } catch (e) {
      try {
        return JSON.parse(jsonrepair(fixed));
      } catch {
        throw new Error(`AI返回的JSON格式错误: ${(e as Error).message}`);
      }
    }
  }
}

function extractBraces(text: string): string | null {
  const startObj = text.indexOf('{');
  const startArr = text.indexOf('[');

  let start: number;
  let openChar: string;
  let closeChar: string;

  if (startObj === -1 && startArr === -1) return null;

  if (startObj === -1) {
    start = startArr; openChar = '['; closeChar = ']';
  } else if (startArr === -1) {
    start = startObj; openChar = '{'; closeChar = '}';
  } else {
    start = Math.min(startObj, startArr);
    openChar = text[start];
    closeChar = openChar === '{' ? '}' : ']';
  }

  let depth = 0;
  let inString = false;
  let escape = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"' && !escape) { inString = !inString; continue; }
    if (inString) continue;

    if (ch === openChar) depth++;
    if (ch === closeChar) {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return text.slice(start);
}

function fixJSON(str: string): string {
  let fixed = str;

  // Fix trailing commas: ,] or ,}
  fixed = fixed.replace(/,\s*([\]}])/g, '$1');

  // If string is truncated mid-value, try to close it
  // Check if we're inside an unclosed string at the end
  let inString = false;
  let escape = false;
  for (let i = 0; i < fixed.length; i++) {
    const ch = fixed[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') inString = !inString;
  }

  // If we ended inside a string, close it
  if (inString) {
    fixed += '"';
  }

  // Fix trailing commas again (after closing string)
  fixed = fixed.replace(/,\s*([\]}])/g, '$1');

  // Count and fix bracket balance
  const objOpens = (fixed.match(/\{/g) || []).length;
  const objCloses = (fixed.match(/\}/g) || []).length;
  const arrOpens = (fixed.match(/\[/g) || []).length;
  const arrCloses = (fixed.match(/\]/g) || []).length;

  // Close any incomplete arrays/objects
  // If we're in the middle of an array element, close the element first
  if (inString || fixed.trim().endsWith(',')) {
    // We were mid-element, need to close array/object stack
    // Simple approach: just close all open brackets
  }

  for (let i = 0; i < arrOpens - arrCloses; i++) fixed += ']';
  for (let i = 0; i < objOpens - objCloses; i++) fixed += '}';

  // Final trailing comma cleanup
  fixed = fixed.replace(/,\s*([\]}])/g, '$1');

  return fixed;
}
