import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// Adapted from reactvideoeditor/remotion-templates templates/stat-counter.tsx
// Source commit: 6209b724798e48ff395f8df1a6fa2d26082372b5 (MIT)
export const statCounterSchema = z.object({
  title: z.string().max(160).default(''),
  label: z.string().max(160).default(''),
  from: z.number().finite().default(0),
  to: z.number().finite(),
  decimals: z.number().int().min(0).max(3).default(0),
  prefix: z.string().max(16).default(''),
  suffix: z.string().max(16).default(''),
  context: z.string().max(200).default(''),
  accentColor: z.string().max(64).default('#60a5fa'),
  backgroundColor: z.string().max(64).default('#111827'),
  textColor: z.string().max(64).default('#ffffff'),
  width: z.number().int().min(320).max(4096).default(1920),
  height: z.number().int().min(240).max(4096).default(1080),
  fps: z.number().int().min(1).max(60).default(30),
  durationFrames: z.number().int().min(1).max(18000).default(120)
});

export type StatCounterProps = z.infer<typeof statCounterSchema>;

export const StatCounter: React.FC<StatCounterProps> = ({
  title,
  label,
  from,
  to,
  decimals,
  prefix,
  suffix,
  context,
  accentColor,
  backgroundColor,
  textColor
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const entrance = spring({frame, fps, config: {damping: 16, stiffness: 110}});
  const endFrame = Math.max(18, Math.min(durationInFrames - 1, Math.round(durationInFrames * 0.62)));
  const value = interpolate(frame, [8, endFrame], [from, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  const contextOpacity = interpolate(frame, [Math.max(0, endFrame - 14), endFrame + 8], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 42%, ${accentColor}22, transparent 42%), ${backgroundColor}`,
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{textAlign: 'center', transform: `scale(${0.88 + entrance * 0.12})`, maxWidth: 1500}}>
        {title ? <div style={{fontSize: 34, fontWeight: 650, opacity: 0.68, marginBottom: 28}}>{title}</div> : null}
        <div style={{fontSize: 142, lineHeight: 1, fontWeight: 800, letterSpacing: -5, color: accentColor}}>
          {prefix}{formatted}{suffix}
        </div>
        {label ? <div style={{fontSize: 48, fontWeight: 700, marginTop: 24}}>{label}</div> : null}
        {context ? (
          <div style={{fontSize: 30, opacity: contextOpacity * 0.7, marginTop: 20, lineHeight: 1.45}}>{context}</div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
