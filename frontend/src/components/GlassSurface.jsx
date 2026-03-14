'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';

export default function GlassSurface({
  children,
  height = 60,
  borderRadius = 18,
  backgroundOpacity = 0.22,
  blur = 12,
  saturation = 1.6,
  isDark = false,
  active = true,
  className,
  style,
}) {
  const surfaceStyle = useMemo(() => {
    if (!active) {
      return {
        ...style,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius: `${borderRadius}px`,
        background: 'transparent',
        backdropFilter: 'none',
        WebkitBackdropFilter: 'none',
        border: '1px solid transparent',
        boxShadow: 'none',
      };
    }

    const baseBackground = isDark
      ? `hsla(220, 16%, 18%, ${backgroundOpacity})`
      : `hsla(0, 0%, 100%, ${backgroundOpacity})`;

    return {
      ...style,
      height: typeof height === 'number' ? `${height}px` : height,
      borderRadius: `${borderRadius}px`,
      background: baseBackground,
      backdropFilter: `blur(${blur}px) saturate(${saturation})`,
      WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation})`,
      border: isDark ? '1px solid rgba(255,255,255,0.16)' : '1px solid rgba(255,255,255,0.62)',
      boxShadow: isDark
        ? '0 8px 24px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.16)'
        : '0 8px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.72)',
    };
  }, [active, backgroundOpacity, blur, borderRadius, height, isDark, saturation, style]);

  return (
    <div className={cn('relative overflow-hidden', className)} style={surfaceStyle}>
      <div className="relative h-full w-full">{children}</div>
    </div>
  );
}
