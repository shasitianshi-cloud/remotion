import {createHash} from 'node:crypto';
import {mkdirSync, readFileSync, writeFileSync, copyFileSync, statSync} from 'node:fs';
import {resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

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
if (request.composition !== 'ImageMotion') fail('UNSUPPORTED_COMPOSITION');
if (!request.props || typeof request.props !== 'object' || Array.isArray(request.props)) fail('INVALID_PROPS');

const p = request.props;
const ints = [
  ['width', 320, 4096],
  ['height', 240, 4096],
  ['fps', 1, 60],
  ['durationFrames', 1, 18000]
];
for (const [key, min, max] of ints) {
  if (!Number.isInteger(p[key]) || p[key] < min || p[key] > max) fail(`INVALID_${key.toUpperCase()}`);
}

const allowedMotion = new Set(['push-in', 'pull-out', 'pan-left', 'pan-right', 'none']);
if (!allowedMotion.has(p.motion)) fail('INVALID_MOTION');
if (typeof p.backgroundColor !== 'string' || p.backgroundColor.length > 64) fail('INVALID_BACKGROUND_COLOR');
if (typeof p.imageUrl !== 'string') fail('INVALID_IMAGE_URL');
if (p.imageUrl) {
  let url;
  try {
    url = new URL(p.imageUrl);
  } catch {
    fail('INVALID_IMAGE_URL');
  }
  if (url.protocol !== 'https:') fail('IMAGE_URL_MUST_USE_HTTPS');
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
    request.composition,
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
};

writeFileSync(evidencePath, JSON.stringify(evidence, null, 2));
console.log(`REMOTE_RENDER_SUCCESS request_id=${request.request_id} sha256=${outputSha256}`);
