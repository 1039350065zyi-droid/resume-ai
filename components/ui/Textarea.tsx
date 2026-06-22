'use client';

import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-sm font-medium text-[#1c1c1e] mb-1.5">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`w-full px-4 py-3 border rounded-xl shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#007aff]/30 focus:border-[#007aff] resize-none ${
          error ? 'border-[#ff3b30] focus:ring-[#ff3b30]/30' : 'border-[#d1d1d6]'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-[#ff3b30]">{error}</p>}
    </div>
  );
}
