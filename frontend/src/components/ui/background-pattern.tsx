'use client';

import React, { useSyncExternalStore } from 'react';
import { Gamepad2, Mouse, Headset, Swords, Target } from 'lucide-react';

const emptySubscribe = () => () => {};

export function BackgroundPattern() {
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  if (!mounted) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[-1] overflow-hidden bg-background transition-colors duration-500">
      
      {/* 1. Aurora / Mesh Gradients (Smooth & Static or very slow) */}
      <div 
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full opacity-30 dark:opacity-20 blur-[120px] pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        }} 
      />
      <div 
        className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-20 dark:opacity-15 blur-[130px] pointer-events-none" 
        style={{ 
          background: 'radial-gradient(circle, var(--info) 0%, transparent 70%)',
        }} 
      />
      <div 
        className="absolute top-[20%] left-[50%] w-[50%] h-[50%] rounded-full opacity-10 dark:opacity-[0.08] blur-[100px] pointer-events-none transform -translate-x-1/2" 
        style={{ 
          background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
        }} 
      />

      {/* 2. Minimalist Grid Pattern (Focused on top) */}
      <div 
        className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--foreground) 1px, transparent 1px),
            linear-gradient(to bottom, var(--foreground) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          maskImage: 'radial-gradient(ellipse at top center, black 10%, transparent 60%)',
          WebkitMaskImage: 'radial-gradient(ellipse at top center, black 10%, transparent 60%)'
        }}
      />

      {/* 3. Static Subtle Watermark Icons */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]">
        <StaticIcon Icon={Gamepad2} top="15%" left="15%" size={80} rotation={-15} />
        <StaticIcon Icon={Mouse} top="25%" left="85%" size={64} rotation={25} />
        <StaticIcon Icon={Headset} top="65%" left="12%" size={90} rotation={10} />
        <StaticIcon Icon={Swords} top="55%" left="82%" size={100} rotation={-20} />
        <StaticIcon Icon={Target} top="80%" left="50%" size={70} rotation={0} />
      </div>

      {/* 4. Noise Texture Overlay (Premium Glassmorphism Feel) */}
      <div 
        className="absolute inset-0 opacity-[0.35] dark:opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
          backgroundRepeat: 'repeat',
          backgroundSize: '150px 150px',
        }}
      />
    </div>
  );
}

interface StaticIconProps {
  Icon: React.ElementType<{ size?: number; strokeWidth?: number }>;
  top: string;
  left: string;
  size: number;
  rotation?: number;
}

function StaticIcon({ Icon, top, left, size, rotation = 0 }: StaticIconProps) {
  return (
    <div 
      className="absolute text-foreground"
      style={{ 
        top, 
        left, 
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`
      }}
    >
      <Icon size={size} strokeWidth={1} />
    </div>
  );
}
