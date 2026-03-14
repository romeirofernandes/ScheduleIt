'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import Grainient from '@/components/Grainient';

export default function LandingBackground() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === 'dark';

  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Grainient
          color1={isDark ? '#202020' : '#EFE6DE'}
          color2="#E8733A"
          color3={isDark ? '#161B24' : '#FAF6F1'}
          timeSpeed={0.5}
          warpStrength={0.85}
          warpFrequency={4.2}
          warpSpeed={2}
          warpAmplitude={52.0}
          rotationAmount={350.0}
          contrast={1.05}
          saturation={0.72}
          grainAmount={0.1}
          grainScale={2.0}
          zoom={0.7}
          centerX={-0.16}
          centerY={0.02}
        />
    </div>
  );
}
