'use client';

import React, { useCallback, useState, useRef } from 'react';

interface FileUploadProps {
  label: string;
  description?: string;
  accept?: string;
  maxSize?: number;
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  disabled?: boolean;
  showTextInput?: boolean;
  onTextSubmit?: (text: string) => void;
}

export function FileUpload({
  label, description, accept = '.pdf,.txt,.md,.png,.jpg,.jpeg', maxSize = 10,
  onFileSelect, onFileRemove, selectedFile, disabled = false,
  showTextInput = true, onTextSubmit,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showText, setShowText] = useState(false);
  const [textValue, setTextValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): boolean => {
    setError(null);
    if (file.size > maxSize * 1024 * 1024) { setError(`文件大小超过 ${maxSize}MB 限制`); return false; }
    const accepted = accept.split(',').map((t) => t.trim().toLowerCase());
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!accepted.some((t) => t === ext || file.type.startsWith(t.replace('.', '')))) { setError(`不支持的文件格式`); return false; }
    return true;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => { if (validateFile(file)) onFileSelect(file); }, [validateFile, onFileSelect]);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const fileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return '📄';
    if (ext === 'txt') return '📝';
    if (ext === 'md') return '📋';
    if (ext === 'png' || ext === 'jpg' || ext === 'jpeg') return '🖼️';
    return '📎';
  };

  const handleTextSubmit = () => { if (textValue.trim() && onTextSubmit) { onTextSubmit(textValue.trim()); setShowText(false); } };

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-white/80 mb-3">{label}</label>

      {selectedFile ? (
        <div className="glass-card-green p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center text-xl">{fileIcon(selectedFile.name)}</div>
              <div>
                <p className="font-medium text-white text-sm">{selectedFile.name}</p>
                <p className="text-xs text-white/40">{formatSize(selectedFile.size)}</p>
              </div>
            </div>
            {onFileRemove && (
              <button onClick={(e) => { e.stopPropagation(); onFileRemove(); }} disabled={disabled}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 text-white/50 hover:bg-white/20 hover:text-white active:scale-90 transition-all">✕</button>
            )}
          </div>
        </div>
      ) : (
        <>
          <div
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
              isDragging ? 'border-[#007aff] bg-[#007aff]/10 scale-[1.01]' : 'border-white/10 hover:border-white/20 hover:bg-white/[0.03]'
            } ${disabled ? 'opacity-30 cursor-not-allowed' : ''}`}
            onDragOver={(e) => { e.preventDefault(); if (!disabled) setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (!disabled && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => !disabled && inputRef.current?.click()}
          >
            <input ref={inputRef} type="file" className="hidden" accept={accept}
              onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); if (inputRef.current) inputRef.current.value = ''; }}
              disabled={disabled} />
            <div className="space-y-3">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-3xl border border-white/10">
                {isDragging ? '📥' : '📤'}
              </div>
              <div>
                <p className="text-base font-medium text-white/70">{isDragging ? '松开鼠标上传文件' : '拖拽文件到此处'}</p>
                <p className="text-sm text-white/30 mt-1">或点击选择文件</p>
              </div>
              {description && <p className="text-xs text-white/20">{description}</p>}
            </div>
          </div>

          {showTextInput && onTextSubmit && (
            <div className="mt-3">
              <button onClick={() => setShowText(!showText)} className="text-sm text-[#5ac8fa] hover:text-[#007aff] font-medium flex items-center gap-1 transition-colors">
                <span>{showText ? '收起' : '或直接粘贴文字'}</span>
                <span className="text-xs">{showText ? '▲' : '▼'}</span>
              </button>
              {showText && (
                <div className="mt-3 space-y-3">
                  <textarea value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="在此粘贴文字内容..." rows={5}
                    className="glass-input w-full text-sm resize-none" disabled={disabled} />
                  <button onClick={handleTextSubmit} disabled={!textValue.trim() || disabled}
                    className="btn-primary text-sm px-4 py-2 disabled:opacity-30">确认使用此文字</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {error && <p className="mt-2 text-sm text-[#ff453a]">{error}</p>}
    </div>
  );
}
