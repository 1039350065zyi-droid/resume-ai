'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-[#f2f2f7] text-[#636366]',
    success: 'bg-[#34c759]/10 text-[#248a3d]',
    warning: 'bg-[#ff9500]/10 text-[#c93400]',
    danger: 'bg-[#ff3b30]/10 text-[#d70015]',
    info: 'bg-[#007aff]/10 text-[#0040dd]',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full px-2.5 py-0.5 text-xs ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
