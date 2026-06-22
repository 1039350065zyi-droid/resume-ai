'use client';

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  onClick?: () => void;
}

export function Card({ children, className = '', hover = false, glass = false, onClick }: CardProps) {
  const base = glass
    ? 'backdrop-blur-xl bg-white/80 border border-white/50 shadow-sm'
    : 'bg-white border border-black/[0.04] shadow-sm';

  const hoverCls = hover ? 'hover:shadow-md hover:-translate-y-0.5 cursor-pointer active:scale-[0.99]' : '';

  return (
    <div
      className={`${base} rounded-2xl p-6 ${hoverCls} transition-all duration-300 ease-out ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export function CardContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}
