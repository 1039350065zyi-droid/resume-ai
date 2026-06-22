'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97]';

  const variants = {
    primary: 'bg-[#007aff] text-white hover:bg-[#0056cc] focus-visible:ring-[#007aff] shadow-sm',
    secondary: 'bg-[#8e8e93] text-white hover:bg-[#636366] focus-visible:ring-[#8e8e93] shadow-sm',
    outline: 'bg-white border border-[#d1d1d6] text-[#1c1c1e] hover:bg-[#f2f2f7] focus-visible:ring-[#007aff]',
    ghost: 'text-[#007aff] hover:bg-[#f2f2f7] focus-visible:ring-[#007aff]',
    danger: 'bg-[#ff3b30] text-white hover:bg-[#d32f2f] focus-visible:ring-[#ff3b30] shadow-sm',
  };

  const sizes = {
    sm: 'px-3.5 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          处理中...
        </>
      ) : (
        children
      )}
    </button>
  );
}
