import React from 'react';
import {AbsoluteFill, OffthreadVideo, useCurrentFrame} from 'remotion';
import {z} from 'zod';
import {contentFontFamily} from '../fonts';

const segmentSchema = z.object({
  caption_id: z.string().min(1), start_frame: z.number().int().nonnegative(),
  end_frame_exclusive: z.number().int().positive(), text: z.string().min(1),
  lines: z.array(z.string().min(1)).min(1).max(2), placement: z.enum(['BOTTOM_CENTER','TOP_CENTER']).optional()
});

export const captionLayerSchema = z.object({
  baseVideoUrl: z.string().url().optional(), sourceVideoMuted: z.boolean().optional(), backgroundColor: z.string(),
  segments: z.array(segmentSchema), width: z.number().int(), height: z.number().int(),
  fps: z.number().int(), durationFrames: z.number().int(), fontSize: z.number().min(24).max(72),
  fontWeight: z.enum(['400','700','800']), lineHeight: z.number().min(1).max(1.6),
  maxWidth: z.number().min(300), bottomOffset: z.number().min(24), textAlign: z.enum(['center']),
  textColor: z.string(), plateColor: z.string()
});
export type CaptionLayerProps = z.infer<typeof captionLayerSchema>;

export const CaptionLayer: React.FC<CaptionLayerProps> = (p) => {
  const frame = useCurrentFrame();
  const active = p.segments.find((s) => frame >= s.start_frame && frame < s.end_frame_exclusive);
  const placement = active?.placement ?? 'BOTTOM_CENTER';
  return <AbsoluteFill style={{backgroundColor:p.backgroundColor}}>
    {p.baseVideoUrl ? <OffthreadVideo src={p.baseVideoUrl} muted={p.sourceVideoMuted ?? false} style={{width:'100%',height:'100%',objectFit:'cover'}}/> : null}
    {active ? <div data-caption-id={active.caption_id} style={{position:'absolute',left:'50%',transform:'translateX(-50%)',maxWidth:p.maxWidth,width:'max-content',boxSizing:'border-box',padding:'8px 18px 10px',borderRadius:8,background:p.plateColor,color:p.textColor,fontFamily:contentFontFamily,fontSize:p.fontSize,fontWeight:Number(p.fontWeight),lineHeight:p.lineHeight,textAlign:p.textAlign,whiteSpace:'nowrap',...(placement === 'TOP_CENTER' ? {top:p.bottomOffset} : {bottom:p.bottomOffset})}}>
      {active.lines.map((line,i)=><React.Fragment key={`${active.caption_id}-${i}`}>{i ? <br/> : null}{line}</React.Fragment>)}
    </div> : null}
  </AbsoluteFill>;
};
