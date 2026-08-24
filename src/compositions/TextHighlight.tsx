import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {contentFontFamily} from '../fonts';

// Adapted from reactvideoeditor/remotion-templates templates/text-highlight.tsx
// Source commit: 6209b724798e48ff395f8df1a6fa2d26082372b5 (MIT)
export const textHighlightSchema = z.object({
  title: z.string().max(160).default(''),
  phrases: z.array(z.string().min(1).max(80)).min(1).max(12),
  framesPerPhrase: z.number().int().min(8).max(180).default(24),
  highlightColor: z.string().max(64).default('#3b82f6'),
  backgroundColor: z.string().max(64).default('#111827'),
  textColor: z.string().max(64).default('#ffffff'),
  width: z.number().int().min(320).max(4096).default(1920),
  height: z.number().int().min(240).max(4096).default(1080),
  fps: z.number().int().min(1).max(60).default(30),
  durationFrames: z.number().int().min(1).max(18000).default(150)
});

export type TextHighlightProps = z.infer<typeof textHighlightSchema>;

export const TextHighlight: React.FC<TextHighlightProps> = ({
  title,
  phrases,
  framesPerPhrase,
  highlightColor,
  backgroundColor,
  textColor
}) => {
  const frame = useCurrentFrame();
  const phraseCount = Math.max(1, phrases.length);
  const fontSize = phraseCount <= 4 ? 74 : phraseCount <= 7 ? 62 : 52;

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(160deg, ${backgroundColor}, #0b1020)`,
        color: textColor,
        fontFamily: contentFontFamily,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '8% 10%',
        boxSizing: 'border-box'
      }}
    >
      <div style={{width: '100%', maxWidth: 1500}}>
        {title ? (
          <div
            style={{
              fontSize: 30,
              fontWeight: 700,
              opacity: 0.62,
              marginBottom: 34,
              letterSpacing: 1
            }}
          >
            {title}
          </div>
        ) : null}

        <div style={{display: 'flex', flexWrap: 'wrap', gap: '18px 22px', lineHeight: 1.35}}>
          {phrases.map((phrase, index) => {
            const start = index * framesPerPhrase;
            const enter = interpolate(frame, [start, start + framesPerPhrase * 0.45], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            });
            const dim = interpolate(frame, [start + framesPerPhrase * 0.65, start + framesPerPhrase], [1, 0.42], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp'
            });

            return (
              <span
                key={`${index}-${phrase}`}
                style={{
                  position: 'relative',
                  display: 'inline-block',
                  padding: '7px 13px',
                  fontSize,
                  fontWeight: 800,
                  letterSpacing: -1.2,
                  opacity: Math.max(0.22, dim),
                  transform: `translateY(${(1 - enter) * 18}px)`
                }}
              >
                <span
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    bottom: 2,
                    height: '34%',
                    backgroundColor: highlightColor,
                    borderRadius: 10,
                    transformOrigin: 'left center',
                    transform: `scaleX(${enter})`,
                    opacity: 0.78
                  }}
                />
                <span style={{position: 'relative'}}>{phrase}</span>
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
