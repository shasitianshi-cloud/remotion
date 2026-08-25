import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {validatePrimitive} from './primitive-validation.mjs';

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const requestPath = process.argv[2];
if (!requestPath) fail('Usage: node scripts/render-request.mjs <request.json>');

const raw = readFileSync(requestPath);
const requestSha256 = createHash('sha256').update(raw).digest('hex');
const expectedSha = process.env.EXPECTED_REQUEST_SHA256 || '';
if (expectedSha && expectedSha !== requestSha256) {
  fail(`REQUEST_SHA256_MISMATCH expected=${expectedSha} actual=${requestSha256}`);
}

let request;
try {
  request = JSON.parse(raw.toString('utf8'));
} catch (error) {
  fail(`INVALID_REQUEST_JSON: ${error.message}`);
}

const expectedRequestId = process.env.EXPECTED_REQUEST_ID || '';
if (typeof request.request_id !== 'string' || request.request_id.length < 1 || request.request_id.length > 128) {
  fail('INVALID_REQUEST_ID');
}
if (expectedRequestId && expectedRequestId !== request.request_id) {
  fail(`REQUEST_ID_MISMATCH expected=${expectedRequestId} actual=${request.request_id}`);
}

const supportedCompositions = new Set([
  'ImageMotion',
  'TextHighlight',
  'StatCounter',
  'ComparisonChart',
  'ProgressSteps'
  ,'PAN_ZOOM_FOCUS','CALLOUT','REGION_HIGHLIGHT','PATH_TRACE','SPLIT_COMPARE','IMAGE_SEQUENCE','DOCUMENT_FOCUS','LABEL_ANCHOR'
  ,'CAPTION_LAYER'
]);
if (!supportedCompositions.has(request.composition)) fail('UNSUPPORTED_COMPOSITION');
if (!request.props || typeof request.props !== 'object' || Array.isArray(request.props)) fail('INVALID_PROPS');

const p = request.props;
if (request.composition.includes('_')) {try {validatePrimitive(request.composition,p)} catch(e) {fail(e.message)}}
const requireString = (key, max = 200, allowEmpty = true) => {
  const value = p[key];
  if (typeof value !== 'string' || value.length > max || (!allowEmpty && value.length === 0)) fail(`INVALID_${key.toUpperCase()}`);
};
const requireFiniteNumber = (key) => {
  if (typeof p[key] !== 'number' || !Number.isFinite(p[key])) fail(`INVALID_${key.toUpperCase()}`);
};
const requireInt = (key, min, max) => {
  if (!Number.isInteger(p[key]) || p[key] < min || p[key] > max) fail(`INVALID_${key.toUpperCase()}`);
};

for (const [key, min, max] of [
  ['width', 320, 4096],
  ['height', 240, 4096],
  ['fps', 1, 60],
  ['durationFrames', 1, 18000]
]) {
  requireInt(key, min, max);
}

const requireStyleStrings = () => {
  requireString('backgroundColor', 64, false);
  requireString('textColor', 64, false);
};

switch (request.composition) {
  case 'CAPTION_LAYER': {
    if (p.width !== 1280 || p.height !== 720 || p.fps !== 30) fail('CAPTION_CANONICAL_SPEC_REQUIRED');
    requireString('backgroundColor',64,false); requireString('textColor',64,false); requireString('plateColor',64,false);
    requireInt('fontSize',24,72); requireInt('bottomOffset',24,180);
    if (!['400','700','800'].includes(p.fontWeight)) fail('UNSUPPORTED_LANGUAGE_FONT');
    if (p.textAlign !== 'center' || typeof p.lineHeight !== 'number' || p.lineHeight < 1 || p.lineHeight > 1.6) fail('INVALID_CAPTION_STYLE');
    if (typeof p.maxWidth !== 'number' || p.maxWidth > p.width - 128 || p.maxWidth < 300) fail('CAPTION_LAYOUT_OVERFLOW');
    if (p.baseVideoUrl && (!p.baseVideoUrl.startsWith('https://'))) fail('BASE_VIDEO_URL_MUST_USE_HTTPS');
    if (!Array.isArray(p.segments)) fail('INVALID_CAPTION_SEGMENTS');
    let priorEnd = 0;
    for (const s of p.segments) {
      if (!s || typeof s.caption_id !== 'string' || typeof s.text !== 'string' || !s.text.trim()) fail('EMPTY_CAPTION_TEXT');
      if (!Number.isInteger(s.start_frame) || !Number.isInteger(s.end_frame_exclusive) || s.start_frame < 0 || s.end_frame_exclusive <= s.start_frame) fail('END_BEFORE_START');
      if (s.start_frame < priorEnd) fail('OVERLAPPING_TIMING');
      if (s.end_frame_exclusive > p.durationFrames) fail('OUT_OF_VIDEO_RANGE');
      if (!Array.isArray(s.lines) || s.lines.length < 1 || s.lines.length > 2 || s.lines.some(x=>typeof x !== 'string' || !x.trim())) fail('THREE_LINE_LAYOUT');
      if (s.lines.join('').replace(/\s+/g,'') !== s.text.replace(/\s+/g,'')) fail('NON_VERBATIM_CAPTION');
      priorEnd = s.end_frame_exclusive;
    }
    break;
  }
  case 'PAN_ZOOM_FOCUS':
  case 'CALLOUT':
  case 'REGION_HIGHLIGHT':
  case 'PATH_TRACE':
  case 'SPLIT_COMPARE':
  case 'IMAGE_SEQUENCE':
  case 'DOCUMENT_FOCUS':
  case 'LABEL_ANCHOR':
    break;
  case 'ImageMotion': {
    const allowedMotion = new Set(['push-in', 'pull-out', 'pan-left', 'pan-right', 'none']);
    if (!allowedMotion.has(p.motion)) fail('INVALID_MOTION');
    requireString('backgroundColor', 64, false);
    requireString('imageUrl', 4096, true);
    if (p.imageUrl) {
      let url;
      try {
        url = new URL(p.imageUrl);
      } catch {
        fail('INVALID_IMAGE_URL');
      }
      if (url.protocol !== 'https:') fail('IMAGE_URL_MUST_USE_HTTPS');
    }
    break;
  }

  case 'TextHighlight': {
    requireString('title', 160, true);
    requireString('highlightColor', 64, false);
    requireStyleStrings();
    requireInt('framesPerPhrase', 8, 180);
    if (!Array.isArray(p.phrases) || p.phrases.length < 1 || p.phrases.length > 12) fail('INVALID_PHRASES');
    if (p.phrases.some((item) => typeof item !== 'string' || item.length < 1 || item.length > 80)) fail('INVALID_PHRASES');
    break;
  }

  case 'StatCounter': {
    requireString('title', 160, true);
    requireString('label', 160, true);
    requireString('prefix', 16, true);
    requireString('suffix', 16, true);
    requireString('context', 200, true);
    requireString('accentColor', 64, false);
    requireStyleStrings();
    requireFiniteNumber('from');
    requireFiniteNumber('to');
    requireInt('decimals', 0, 3);
    break;
  }

  case 'ComparisonChart': {
    requireString('title', 160, true);
    requireString('leftLabel', 80, false);
    requireString('rightLabel', 80, false);
    requireString('unit', 16, true);
    requireString('note', 200, true);
    requireString('leftColor', 64, false);
    requireString('rightColor', 64, false);
    requireStyleStrings();
    requireFiniteNumber('leftValue');
    requireFiniteNumber('rightValue');
    break;
  }

  case 'ProgressSteps': {
    requireString('title', 160, true);
    requireString('accentColor', 64, false);
    requireStyleStrings();
    if (!Array.isArray(p.steps) || p.steps.length < 2 || p.steps.length > 8) fail('INVALID_STEPS');
    for (const step of p.steps) {
      if (!step || typeof step !== 'object' || Array.isArray(step)) fail('INVALID_STEPS');
      if (typeof step.label !== 'string' || step.label.length < 1 || step.label.length > 80) fail('INVALID_STEPS');
      if (typeof step.detail !== 'string' || step.detail.length > 160) fail('INVALID_STEPS');
    }
    break;
  }

  default:
    fail('UNSUPPORTED_COMPOSITION');
}

const codec = request.output?.codec ?? 'h264';
if (codec !== 'h264') fail('UNSUPPORTED_CODEC');

mkdirSync('out', {recursive: true});
const outputPath = resolve('out/video.mp4');
const evidencePath = resolve('out/evidence.json');
const preservedRequestPath = resolve('out/request.json');
copyFileSync(requestPath, preservedRequestPath);

const startedAt = new Date().toISOString();
const remotionBin = resolve('node_modules/.bin/remotion');
const render = spawnSync(
  remotionBin,
  [
    'render',
    'src/index.ts',
    request.composition.replaceAll('_', '-'),
    outputPath,
    '--props',
    JSON.stringify(request.props),
    '--codec',
    codec
  ],
  {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}
);

process.stdout.write(render.stdout || '');
process.stderr.write(render.stderr || '');

const baseEvidence = {
  schema_version: 'REMOTION_REMOTE_EVIDENCE_V1',
  request_id: request.request_id,
  request_sha256: requestSha256,
  composition: request.composition,
  source_commit: process.env.GITHUB_SHA || null,
  github_run_id: process.env.GITHUB_RUN_ID || null,
  github_run_attempt: process.env.GITHUB_RUN_ATTEMPT || null,
  remote_render: process.env.GITHUB_ACTIONS === 'true',
  local_render: process.env.GITHUB_ACTIONS !== 'true',
  started_at: startedAt,
  finished_at: new Date().toISOString(),
  render_exit_code: render.status ?? 1
};

if (render.status !== 0) {
  writeFileSync(evidencePath, JSON.stringify({...baseEvidence, success: false}, null, 2));
  fail(`REMOTION_RENDER_FAILED exit=${render.status}`);
}

const probe = spawnSync(
  'ffprobe',
  [
    '-v', 'error',
    '-select_streams', 'v:0',
    '-show_entries', 'stream=codec_name,width,height,r_frame_rate',
    '-show_entries', 'format=duration,size',
    '-of', 'json',
    outputPath
  ],
  {encoding: 'utf8'}
);

if (probe.status !== 0) {
  writeFileSync(evidencePath, JSON.stringify({...baseEvidence, success: false, ffprobe_exit_code: probe.status ?? 1}, null, 2));
  fail(`FFPROBE_FAILED: ${probe.stderr}`);
}

const probeJson = JSON.parse(probe.stdout);
const stream = probeJson.streams?.[0];
const format = probeJson.format ?? {};
if (!stream) fail('VIDEO_STREAM_MISSING');

const outputBytes = readFileSync(outputPath);
const outputSha256 = createHash('sha256').update(outputBytes).digest('hex');
const size = statSync(outputPath).size;
const checkpointFrames = [0, Math.floor((p.durationFrames - 1) / 2), p.durationFrames - 1];
const frameCheckpoints = [];
for (const frame of checkpointFrames) {
  const path = resolve(`out/frame-${frame}.png`);
  const shot = spawnSync('ffmpeg', ['-v','error','-i',outputPath,'-vf',`select=eq(n\\,${frame})`,'-vframes','1',path], {encoding:'utf8'});
  if (shot.status !== 0 || !statSync(path).size) fail(`FRAME_CHECKPOINT_FAILED_${frame}`);
  const bytes = readFileSync(path);
  frameCheckpoints.push({frame,sha256:createHash('sha256').update(bytes).digest('hex'),size_bytes:bytes.length});
}

const evidence = {
  ...baseEvidence,
  success: true,
  ffprobe_exit_code: probe.status,
  output_path: 'out/video.mp4',
  output_sha256: outputSha256,
  output_size_bytes: size,
  video_stream_present: true,
  codec_name: stream.codec_name,
  width: stream.width,
  height: stream.height,
  r_frame_rate: stream.r_frame_rate,
  duration_seconds: Number(format.duration),
  format_size_bytes: Number(format.size)
  ,frame_checkpoints: frameCheckpoints
  ,frame_checkpoint_distinct_count: new Set(frameCheckpoints.map(x=>x.sha256)).size
};

writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
console.log(`REMOTE_RENDER_SUCCESS request_id=${request.request_id} composition=${request.composition} sha256=${outputSha256}`);
