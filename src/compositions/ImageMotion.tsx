import React from 'react';
import {AbsoluteFill, Img, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {z} from 'zod';

export const imageMotionSchema = z.object({
  imageUrl: z.string().default(''),
  motion: z.enum(['push-in', 'pull-out', 'pan-left', 'pan-right', 'none']).default('push-in'),
  backgroundColor: z.string().default('#111111'),
  width: z.number().int().min(320).max(4096).default(1920),
  height: z.number().int().min(240).max(4096).default(1080),
  fps: z.number().int().min(1).max(60).default(30),
  durationFrames: z.number().int().min(1).max(18000).default(150)
});

export type ImageMotionProps = z.infer<typeof imageMotionSchema>;

const getTransform = (motion: ImageMotionProps['motion'], frame: number, duration: number) => {
  const end = Math.max(1, duration - 1);

  switch (motion) {
    case 'pull-out': {
      const scale = interpolate(frame, [0, end], [1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return `scale(${scale})`;
    }
    case 'pan-left': {
      const x = interpolate(frame, [0, end], [2.5, -2.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return `scale(1.06) translateX(${x}%)`;
    }
    case 'pan-right': {
      const x = interpolate(frame, [0, end], [-2.5, 2.5], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return `scale(1.06) translateX(${x}%)`;
    }
    case 'none':
      return 'scale(1)';
    case 'push-in':
    default: {
      const scale = interpolate(frame, [0, end], [1, 1.08], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return `scale(${scale})`;
    }
  }
};

export const ImageMotion: React.FC<ImageMotionProps> = ({
  imageUrl,
  motion,
  backgroundColor
}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const transform = getTransform(motion, frame, durationInFrames);

  return (
    <AbsoluteFill style={{backgroundColor, overflow: 'hidden'}}>
      {imageUrl ? (
        <Img
          src={imageUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform,
            transformOrigin: 'center center'
          }}
        />
      ) : (
        <AbsoluteFill
          style={{
            background: 'linear-gradient(135deg, #111 0%, #383838 45%, #111 100%)',
            transform
          }}
        />
      )}
    </AbsoluteFill>
  );
};
