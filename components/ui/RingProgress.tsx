'use client';

import React from 'react';

interface RingProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
  className?: string;
}

export function RingProgress({ value, max = 100, size = 160, strokeWidth = 10, showLabel = true, className = '' }: RingProgressProps) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  const gradientId = pct >= 80 ? 'gradient-green' : pct >= 60 ? 'gradient-blue' : pct >= 40 ? 'gradient-orange' : 'gradient-red';

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="ring-progress">
        <defs>
          <linearGradient id="gradient-green" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#30d158" />
            <stop offset="100%" stopColor="#5ac8fa" />
          </linearGradient>
          <linearGradient id="gradient-blue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007aff" />
            <stop offset="100%" stopColor="#5ac8fa" />
          </linearGradient>
          <linearGradient id="gradient-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff9f0a" />
            <stop offset="100%" stopColor="#ff453a" />
          </linearGradient>
          <linearGradient id="gradient-red" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ff453a" />
            <stop offset="100%" stopColor="#ff375f" />
          </linearGradient>
          {/* Glow filter */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Track */}
        <circle
          className="ring-progress-track"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Fill */}
        <circle
          className="ring-progress-fill"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          stroke={`url(#${gradientId})`}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter="url(#glow)"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-white tracking-tight">{pct}</span>
          <span className="text-sm text-white/40 mt-0.5">分</span>
        </div>
      )}
    </div>
  );
}
