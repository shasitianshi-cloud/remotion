import React from 'react';
import {AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';
import {contentFontFamily} from '../fonts';

// Adapted from reactvideoeditor/remotion-templates templates/progress-steps.tsx
// Source commit: 6209b724798e48ff395f8df1a6fa2d26082372b5 (MIT)
const stepSchema = z.object({
  label: z.string().min(1).max(80),
  detail: z.string().max(160).default('')
});

export const progressStepsSchema = z.object({
  title: z.string().max(160).default('Process'),
  steps: z.array(stepSchema).min(2).max(8),
  accentColor: z.string().max(64).default('#3b82f6'),
  backgroundColor: z.string().max(64).default('#111827'),
  textColor: z.string().max(64).default('#ffffff'),
  width: z.number().int().min(320).max(4096).default(1920),
  height: z.number().int().min(240).max(4096).default(1080),
  fps: z.number().int().min(1).max(60).default(30),
  durationFrames: z.number().int().min(1).max(18000).default(180)
});

export type ProgressStepsProps = z.infer<typeof progressStepsSchema>;

export const ProgressSteps: React.FC<ProgressStepsProps> = ({
  title,
  steps,
  accentColor,
  backgroundColor,
  textColor
}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const usable = Math.max(1, durationInFrames - Math.round(fps * 0.6));
  const framesPerStep = usable / steps.length;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${backgroundColor}, #0b1020)`,
        color: textColor,
        fontFamily: contentFontFamily,
        padding: '7% 8%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{fontSize: 50, fontWeight: 800, textAlign: 'center', marginBottom: 90}}>{title}</div>
      <div style={{display: 'flex', alignItems: 'flex-start', justifyContent: 'center', width: '100%'}}>
        {steps.map((step, index) => {
          const start = index * framesPerStep;
          const enter = interpolate(frame, [start, start + framesPerStep * 0.45], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          });
          const pulse = spring({
            frame: frame - start,
            fps,
            config: {damping: 16, stiffness: 120, mass: 0.7}
          });
          const connector = index < steps.length - 1
            ? interpolate(frame, [start + framesPerStep * 0.45, start + framesPerStep * 0.9], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp'
              })
            : 0;

          return (
            <React.Fragment key={`${index}-${step.label}`}>
              <div style={{width: 210, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center'}}>
                <div
                  style={{
                    width: 82,
                    height: 82,
                    borderRadius: '50%',
                    border: `4px solid ${enter > 0.05 ? accentColor : '#ffffff30'}`,
                    backgroundColor: enter > 0.05 ? `${accentColor}22` : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 30,
                    fontWeight: 800,
                    transform: `scale(${0.9 + Math.min(1, Math.max(0, pulse)) * 0.1})`,
                    boxShadow: enter > 0.05 ? `0 0 36px ${accentColor}22` : 'none'
                  }}
                >
                  {index + 1}
                </div>
                <div style={{fontSize: 28, fontWeight: 700, marginTop: 22, opacity: Math.max(0.25, enter)}}>{step.label}</div>
                {step.detail ? (
                  <div style={{fontSize: 21, lineHeight: 1.45, opacity: enter * 0.58, marginTop: 12, fontWeight: 400}}>{step.detail}</div>
                ) : null}
              </div>
              {index < steps.length - 1 ? (
                <div style={{width: 92, height: 4, backgroundColor: '#ffffff20', marginTop: 40, position: 'relative', overflow: 'hidden'}}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundColor: accentColor,
                      transformOrigin: 'left center',
                      transform: `scaleX(${connector})`
                    }}
                  />
                </div>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
