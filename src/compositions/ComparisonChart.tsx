import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

// Adapted from reactvideoeditor/remotion-templates templates/comparison-chart.tsx
// Source commit: 6209b724798e48ff395f8df1a6fa2d26082372b5 (MIT)
export const comparisonChartSchema = z.object({
  title: z.string().max(160).default('Comparison'),
  leftLabel: z.string().min(1).max(80),
  rightLabel: z.string().min(1).max(80),
  leftValue: z.number().finite(),
  rightValue: z.number().finite(),
  unit: z.string().max(16).default(''),
  note: z.string().max(200).default(''),
  leftColor: z.string().max(64).default('#ef4444'),
  rightColor: z.string().max(64).default('#3b82f6'),
  backgroundColor: z.string().max(64).default('#111827'),
  textColor: z.string().max(64).default('#ffffff'),
  width: z.number().int().min(320).max(4096).default(1920),
  height: z.number().int().min(240).max(4096).default(1080),
  fps: z.number().int().min(1).max(60).default(30),
  durationFrames: z.number().int().min(1).max(18000).default(150)
});

export type ComparisonChartProps = z.infer<typeof comparisonChartSchema>;

const formatValue = (value: number) => {
  const abs = Math.abs(value);
  if (abs >= 1000) return value.toLocaleString(undefined, {maximumFractionDigits: 1});
  if (Number.isInteger(value)) return String(value);
  return value.toFixed(1);
};

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title,
  leftLabel,
  rightLabel,
  leftValue,
  rightValue,
  unit,
  note,
  leftColor,
  rightColor,
  backgroundColor,
  textColor
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const maxMagnitude = Math.max(1, Math.abs(leftValue), Math.abs(rightValue));
  const maxBarHeight = 380;
  const leftProgress = interpolate(frame, [8, Math.min(48, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const rightProgress = interpolate(frame, [18, Math.min(62, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });
  const noteOpacity = interpolate(frame, [Math.min(50, durationInFrames - 1), Math.min(78, durationInFrames - 1)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  const renderSide = (label: string, value: number, color: string, progress: number) => {
    const barHeight = (Math.abs(value) / maxMagnitude) * maxBarHeight * progress;
    const displayedValue = value * progress;
    return (
      <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end'}}>
        <div style={{fontSize: 62, fontWeight: 800, color, marginBottom: 18, letterSpacing: -2}}>
          {formatValue(displayedValue)}{unit}
        </div>
        <div
          style={{
            width: 190,
            height: barHeight,
            minHeight: 3,
            background: `linear-gradient(180deg, ${color}, ${color}99)`,
            borderRadius: '18px 18px 4px 4px',
            boxShadow: `0 18px 40px ${color}25`
          }}
        />
        <div style={{fontSize: 32, fontWeight: 700, marginTop: 20, opacity: 0.88}}>{label}</div>
      </div>
    );
  };

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(155deg, ${backgroundColor}, #0b1020)`,
        color: textColor,
        fontFamily: 'Inter, system-ui, sans-serif',
        padding: '6% 9%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{fontSize: 48, fontWeight: 780, textAlign: 'center', marginBottom: 42}}>{title}</div>
      <div style={{flex: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 90, minHeight: 0}}>
        {renderSide(leftLabel, leftValue, leftColor, leftProgress)}
        <div style={{height: '82%', width: 2, backgroundColor: '#ffffff22', alignSelf: 'center'}} />
        {renderSide(rightLabel, rightValue, rightColor, rightProgress)}
      </div>
      {note ? (
        <div style={{fontSize: 28, lineHeight: 1.4, textAlign: 'center', opacity: noteOpacity * 0.68, marginTop: 28}}>{note}</div>
      ) : null}
    </AbsoluteFill>
  );
};
