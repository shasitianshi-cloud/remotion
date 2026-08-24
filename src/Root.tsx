import React from 'react';
import {Composition} from 'remotion';
import {ImageMotion, imageMotionSchema} from './compositions/ImageMotion';
import {TextHighlight, textHighlightSchema} from './compositions/TextHighlight';
import {StatCounter, statCounterSchema} from './compositions/StatCounter';
import {ComparisonChart, comparisonChartSchema} from './compositions/ComparisonChart';
import {ProgressSteps, progressStepsSchema} from './compositions/ProgressSteps';
import {TimelineAssembly, timelineAssemblySchema} from './compositions/TimelineAssembly';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="TimelineAssembly" component={TimelineAssembly} schema={timelineAssemblySchema} durationInFrames={90} fps={30} width={1280} height={720} defaultProps={{audio_file:'assets/audio.wav',visual_items:[],width:1280,height:720,fps:30,durationFrames:90}} calculateMetadata={({props})=>({durationInFrames:props.durationFrames,fps:props.fps,width:props.width,height:props.height})}/>
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

      <Composition
        id="TextHighlight"
        component={TextHighlight}
        schema={textHighlightSchema}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Key idea',
          phrases: ['A surprising claim', 'a mechanism', 'and the consequence'],
          framesPerPhrase: 30,
          highlightColor: '#3b82f6',
          backgroundColor: '#111827',
          textColor: '#ffffff',
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

      <Composition
        id="StatCounter"
        component={StatCounter}
        schema={statCounterSchema}
        durationInFrames={120}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'One number changes the picture',
          label: 'Example metric',
          from: 0,
          to: 1247,
          decimals: 0,
          prefix: '',
          suffix: '',
          context: 'Use for a verified statistic or a quantified contrast.',
          accentColor: '#60a5fa',
          backgroundColor: '#111827',
          textColor: '#ffffff',
          width: 1920,
          height: 1080,
          fps: 30,
          durationFrames: 120
        }}
        calculateMetadata={({props}) => ({
          durationInFrames: props.durationFrames,
          fps: props.fps,
          width: props.width,
          height: props.height
        })}
      />

      <Composition
        id="ComparisonChart"
        component={ComparisonChart}
        schema={comparisonChartSchema}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Before vs after',
          leftLabel: 'Before',
          rightLabel: 'After',
          leftValue: 34,
          rightValue: 89,
          unit: '%',
          note: 'Use for competing explanations, states, or measurable outcomes.',
          leftColor: '#ef4444',
          rightColor: '#3b82f6',
          backgroundColor: '#111827',
          textColor: '#ffffff',
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

      <Composition
        id="ProgressSteps"
        component={ProgressSteps}
        schema={progressStepsSchema}
        durationInFrames={180}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'How it happens',
          steps: [
            {label: 'Trigger', detail: 'What starts the process'},
            {label: 'Mechanism', detail: 'What changes in the middle'},
            {label: 'Result', detail: 'What becomes observable'}
          ],
          accentColor: '#3b82f6',
          backgroundColor: '#111827',
          textColor: '#ffffff',
          width: 1920,
          height: 1080,
          fps: 30,
          durationFrames: 180
        }}
        calculateMetadata={({props}) => ({
          durationInFrames: props.durationFrames,
          fps: props.fps,
          width: props.width,
          height: props.height
        })}
      />
    </>
  );
};
