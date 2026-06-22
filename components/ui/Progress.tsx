'use client';

import React from 'react';

interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function Progress({ value, max = 100, size = 'md', showLabel = false, className = '' }: ProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);

  const sizes = { sm: 'h-1.5', md: 'h-3', lg: 'h-4' };
  const color = pct >= 80 ? 'bg-[#34c759]' : pct >= 60 ? 'bg-[#ff9500]' : 'bg-[#ff3b30]';

  return (
    <div className={className}>
      {showLabel && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#636366]">匹配度</span>
          <span className="text-sm font-bold text-[#1c1c1e]">{pct}%</span>
        </div>
      )}
      <div className={`w-full bg-[#f2f2f7] rounded-full overflow-hidden ${sizes[size]}`}>
        <div
          className={`${sizes[size]} rounded-full ${color} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
