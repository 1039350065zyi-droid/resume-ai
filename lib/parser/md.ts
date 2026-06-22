export function parseMarkdown(content: string): string {
  let text = content;

  // Remove headers
  text = text.replace(/^#{1,6}\s+/gm, '');

  // Remove bold/italic
  text = text.replace(/\*\*(.*?)\*\*/g, '$1');
  text = text.replace(/\*(.*?)\*/g, '$1');
  text = text.replace(/__(.*?)__/g, '$1');
  text = text.replace(/_(.*?)_/g, '$1');

  // Remove links
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // Remove images
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1');

  // Remove code blocks
  text = text.replace(/```[\s\S]*?```/g, '');
  text = text.replace(/`([^`]+)`/g, '$1');

  // Remove blockquotes
  text = text.replace(/^>\s+/gm, '');

  // Remove horizontal rules
  text = text.replace(/^[-*_]{3,}\s*$/gm, '');

  // Remove list markers
  text = text.replace(/^\s*[-*+]\s+/gm, '');
  text = text.replace(/^\s*\d+\.\s+/gm, '');

  // Clean up
  text = text.replace(/\n{3,}/g, '\n\n');
  return text.trim();
}
