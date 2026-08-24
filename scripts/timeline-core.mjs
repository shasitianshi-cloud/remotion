export const fail=(code)=>{throw new Error(code)};
export function validateTimeline(r,media){
 if(!r||typeof r!=='object'||!r.request_id||!r.event_id)fail('INVALID_REQUEST');
 if(r.width!==1280||r.height!==720||r.fps!==30)fail('NON_CANONICAL_VIDEO_SPEC');
 if(!r.audio||!Array.isArray(r.visual_items)||!r.visual_items.length)fail('INVALID_MEDIA');
 const sources=[r.audio,...r.visual_items];
 for(const x of sources){const s=x.source;if(!s||!['HTTPS_URL','GITHUB_ACTIONS_ARTIFACT'].includes(s.source_type))fail('UNSUPPORTED_SOURCE_TYPE');if(s.source_type==='HTTPS_URL'){let u;try{u=new URL(s.url)}catch{fail('INVALID_HTTPS_URL')}if(u.protocol!=='https:'||['localhost','127.0.0.1','::1'].includes(u.hostname))fail('INVALID_HTTPS_URL')}if(s.source_type==='GITHUB_ACTIONS_ARTIFACT'&&s.repository!=='shasitianshi-cloud/remotion')fail('INVALID_ARTIFACT_REPOSITORY')}
 const audio=media.audio;if(!audio||!Number.isFinite(audio.duration_seconds))fail('AUDIO_PROBE_MISSING');
 const tolerance=Math.max(.15,2/r.fps);if(Math.abs(audio.duration_seconds-r.audio.expected_duration_seconds)>tolerance)fail('AUDIO_DURATION_MISMATCH');
 const frames=Math.ceil(audio.duration_seconds*r.fps);const sorted=[...r.visual_items].sort((a,b)=>a.start_frame-b.start_frame);let cursor=0;
 for(const item of sorted){if(item.start_frame>cursor)fail('TIMELINE_VISUAL_GAP');if(item.start_frame<cursor)fail('TIMELINE_VISUAL_OVERLAP');const end=item.start_frame+item.duration_frames;if(item.kind==='VIDEO'){const m=media.visual_items[item.visual_item_id];if(!m||m.duration_seconds+Math.max(.15,2/r.fps)<item.duration_frames/r.fps)fail('VIDEO_SOURCE_TOO_SHORT')}cursor=end}
 if(cursor<frames)fail('TIMELINE_VISUAL_GAP');if(cursor>frames+2)fail('TIMELINE_VISUAL_OVERFLOW');return {resolved_duration_frames:frames,visual_coverage_pass:true,tolerance_seconds:tolerance};
}
