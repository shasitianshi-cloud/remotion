import React from 'react';
import {AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {z} from 'zod';

const visualSchema=z.object({visual_item_id:z.string(),visual_beat_id:z.string(),kind:z.enum(['VIDEO','IMAGE']),resolved_file:z.string(),start_frame:z.number().int().nonnegative(),duration_frames:z.number().int().positive(),fit:z.enum(['COVER','CONTAIN'])});
export const timelineAssemblySchema=z.object({audio_file:z.string(),visual_items:z.array(visualSchema).min(1),width:z.number().int(),height:z.number().int(),fps:z.number().int(),durationFrames:z.number().int().positive()});
export type TimelineAssemblyProps=z.infer<typeof timelineAssemblySchema>;

export const TimelineAssembly:React.FC<TimelineAssemblyProps>=({audio_file,visual_items})=><AbsoluteFill style={{backgroundColor:'black'}}>
  <Audio src={staticFile(audio_file)}/>
  {visual_items.map((item)=><Sequence key={item.visual_item_id} from={item.start_frame} durationInFrames={item.duration_frames} premountFor={15}>
    <AbsoluteFill>{item.kind==='IMAGE'?<Img src={staticFile(item.resolved_file)} style={{width:'100%',height:'100%',objectFit:item.fit.toLowerCase() as 'cover'|'contain'}}/>:<OffthreadVideo src={staticFile(item.resolved_file)} style={{width:'100%',height:'100%',objectFit:item.fit.toLowerCase() as 'cover'|'contain'}}/>}</AbsoluteFill>
  </Sequence>)}
</AbsoluteFill>;
