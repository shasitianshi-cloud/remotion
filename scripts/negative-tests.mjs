import {validateTimeline} from './timeline-core.mjs';
const source={source_type:'HTTPS_URL',url:'https://example.com/a'};const base={request_id:'t',event_id:'e',fps:30,audio:{source,expected_duration_seconds:3},visual_items:[{visual_item_id:'v1',visual_beat_id:'b1',kind:'VIDEO',source,start_frame:0,duration_frames:45,fit:'COVER'},{visual_item_id:'v2',visual_beat_id:'b2',kind:'VIDEO',source,start_frame:45,duration_frames:45,fit:'COVER'}]};const media={audio:{duration_seconds:3},visual_items:{v1:{duration_seconds:2},v2:{duration_seconds:2}}};
const expect=(name,mutate,code)=>{const r=structuredClone(base);mutate(r);try{validateTimeline(r,media);throw new Error(name+'_DID_NOT_FAIL')}catch(e){if(e.message!==code)throw e;console.log(name+'=PASS')}};
expect('NEGATIVE_GAP_TEST',r=>r.visual_items[1].start_frame=46,'TIMELINE_VISUAL_GAP');
expect('NEGATIVE_OVERLAP_TEST',r=>r.visual_items[1].start_frame=44,'TIMELINE_VISUAL_OVERLAP');
expect('NEGATIVE_SHORT_VIDEO_TEST',r=>r.visual_items[0].duration_frames=75,'VIDEO_SOURCE_TOO_SHORT');
expect('NEGATIVE_AUDIO_MISMATCH_TEST',r=>r.audio.expected_duration_seconds=4,'AUDIO_DURATION_MISMATCH');
expect('NEGATIVE_LOCAL_FILE_TEST',r=>r.audio.source={source_type:'LOCAL_FILE',path:'/tmp/a.wav'},'UNSUPPORTED_SOURCE_TYPE');
