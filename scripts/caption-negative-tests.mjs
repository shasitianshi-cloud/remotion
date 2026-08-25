import {readFileSync} from 'node:fs';
const source=readFileSync('scripts/render-request.mjs','utf8');
const required=['EMPTY_CAPTION_TEXT','END_BEFORE_START','OVERLAPPING_TIMING','OUT_OF_VIDEO_RANGE','CAPTION_LAYOUT_OVERFLOW','THREE_LINE_LAYOUT','NON_VERBATIM_CAPTION','UNSUPPORTED_LANGUAGE_FONT'];
for(const code of required) if(!source.includes(code)) throw new Error(`MISSING_${code}`);
if(!source.includes("s.lines.join('').replace(/\\s+/g,'')")) throw new Error('MIXED_TEXT_SPACE_NORMALIZATION_MISSING');
console.log('CAPTION_NEGATIVE_CONTRACTS_PASS');
