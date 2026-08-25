import React from 'react';
import {Composition} from 'remotion';
import {ImageMotion, imageMotionSchema} from './compositions/ImageMotion';
import {TextHighlight, textHighlightSchema} from './compositions/TextHighlight';
import {StatCounter, statCounterSchema} from './compositions/StatCounter';
import {ComparisonChart, comparisonChartSchema} from './compositions/ComparisonChart';
import {ProgressSteps, progressStepsSchema} from './compositions/ProgressSteps';
import {PanZoomFocus,panZoomFocusSchema,Callout,calloutSchema,RegionHighlight,regionHighlightSchema,PathTrace,pathTraceSchema,SplitCompare,splitCompareSchema,ImageSequence,imageSequenceSchema,DocumentFocus,documentFocusSchema,LabelAnchor,labelAnchorSchema} from './compositions/VisualPrimitives';
import {CaptionLayer, captionLayerSchema} from './compositions/CaptionLayer';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="CAPTION-LAYER" component={CaptionLayer} schema={captionLayerSchema} durationInFrames={150} fps={30} width={1280} height={720} defaultProps={{backgroundColor:'#172033',segments:[],width:1280,height:720,fps:30,durationFrames:150,fontSize:42,fontWeight:'700',lineHeight:1.28,maxWidth:1088,bottomOffset:62,textAlign:'center',textColor:'#ffffff',plateColor:'rgba(0,0,0,0.72)'}} calculateMetadata={({props})=>({durationInFrames:props.durationFrames,fps:props.fps,width:props.width,height:props.height})}/>
      {[["PAN-ZOOM-FOCUS",PanZoomFocus,panZoomFocusSchema],["CALLOUT",Callout,calloutSchema],["REGION-HIGHLIGHT",RegionHighlight,regionHighlightSchema],["PATH-TRACE",PathTrace,pathTraceSchema],["SPLIT-COMPARE",SplitCompare,splitCompareSchema],["IMAGE-SEQUENCE",ImageSequence,imageSequenceSchema],["DOCUMENT-FOCUS",DocumentFocus,documentFocusSchema],["LABEL-ANCHOR",LabelAnchor,labelAnchorSchema]].map(([id,component,schema])=><Composition key={id as string} id={id as string} component={component as any} schema={schema as any} durationInFrames={90} fps={30} width={1280} height={720} defaultProps={{} as any} calculateMetadata={({props}:any)=>({durationInFrames:props.durationFrames,fps:props.fps,width:props.width,height:props.height})}/>)}
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
