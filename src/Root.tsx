import React from 'react';
import {Composition} from 'remotion';
import {ImageMotion, imageMotionSchema} from './compositions/ImageMotion';

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="ImageMotion"
      component={ImageMotion}
      schema={imageMotionSchema}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={{
        imageUrl: '',
        motion: 'push-in',
        backgroundColor: '#111111',
        width: 1920,
        height: 1080,
        fps: 30,
        durationFrames: 150
      }}
      calculateMetadata={({props}) => ({
        durationInFrames: props.durationFrames,
        fps: props.fps,
        width: props.width,
        height: props.height
      })}
    />
  );
};
