export const validatePrimitive=(c,p)=>{const fail=x=>{throw new Error(x)},unit=n=>Number.isFinite(n)&&n>=0&&n<=1,reg=r=>r&&['RECT','ELLIPSE'].includes(r.type)&&unit(r.x)&&unit(r.y)&&r.width>0&&r.height>0&&r.x+r.width<=1&&r.y+r.height<=1;
 const src=x=>typeof x==='string'&&x.startsWith('https://');
 if(c==='PAN_ZOOM_FOCUS'){if(!src(p.src)||p.start_scale<.5||p.end_scale>4||![p.start_x,p.start_y,p.end_x,p.end_y].every(unit))fail('PAN_ZOOM_OUT_OF_RANGE');if(p.protected_region&&!reg(p.protected_region))fail('PROTECTED_REGION_INVALID')}
 if(c==='CALLOUT'){if(!src(p.src)||!unit(p.anchor_x)||!unit(p.anchor_y))fail('CALLOUT_ANCHOR_OUT_OF_RANGE')}
 if(c==='REGION_HIGHLIGHT'){if(!p.region||p.region.width<=0||p.region.height<=0)fail('REGION_EMPTY');if(!reg(p.region))fail('REGION_OUT_OF_RANGE')}
 if(c==='PATH_TRACE'){if(!src(p.src)||!Array.isArray(p.points)||p.points.length<2)fail('PATH_TOO_FEW_POINTS');if(p.points.some(x=>!unit(x.x)||!unit(x.y)))fail('PATH_POINT_OUT_OF_RANGE')}
 if(c==='SPLIT_COMPARE'){if(!src(p.left_src)||!src(p.right_src))fail('SPLIT_MISSING_SOURCE');if(!(p.split_ratio>.1&&p.split_ratio<.9))fail('SPLIT_RATIO_INVALID')}
 if(c==='IMAGE_SEQUENCE'){if(!Array.isArray(p.items)||!p.items.length)fail('SEQUENCE_EMPTY');let cur=0;for(const x of [...p.items].sort((a,b)=>a.start_frame-b.start_frame)){if(!src(x.src))fail('SEQUENCE_SOURCE_INVALID');if(x.start_frame>cur)fail('SEQUENCE_GAP');if(x.start_frame<cur)fail('SEQUENCE_OVERLAP');cur=x.start_frame+x.duration_frames}if(cur!==p.durationFrames)fail(cur<p.durationFrames?'SEQUENCE_GAP':'SEQUENCE_OVERLAP')}
 if(c==='DOCUMENT_FOCUS'){if(!src(p.src)||!Array.isArray(p.focus_regions)||!p.focus_regions.length||p.focus_regions.some(x=>!reg(x)))fail('DOCUMENT_FOCUS_REGION_OUT_OF_RANGE')}
 if(c==='LABEL_ANCHOR'){if(!src(p.src)||!Array.isArray(p.anchors)||!p.anchors.length||p.anchors.some(x=>!unit(x.x)||!unit(x.y)))fail('LABEL_ANCHOR_OUT_OF_RANGE')}
 return true};
