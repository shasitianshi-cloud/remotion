# Remotion Remote Runtime

A minimal GitHub-hosted Remotion render runtime designed to be called from a small VPS.

The VPS is the control plane. GitHub Actions is the render plane.

```text
VPS / Host LLM
  -> build + hash render request
  -> workflow_dispatch
  -> GitHub Actions runner
  -> Remotion + Chromium render
  -> ffprobe verification
  -> MP4 + request + evidence artifact
  -> VPS polls / downloads / verifies
```

## Scope

This repository intentionally does **not** contain content generation, visual planning, workflow orchestration, memory, or project state. It only provides a deterministic remote render surface.

Initial composition:

- `ImageMotion` - a static image (or smoke-test gradient) with subtle camera motion.

Future reusable video skills/templates can add compositions without changing the VPS-side transport contract.

## Why this layout

The runtime is based on the normal Remotion project structure and CLI render model used by the official Remotion templates. The GitHub Actions shape is informed by existing Remotion projects that render in CI and upload the resulting video as an artifact.

Reference projects:

- `remotion-dev/template-helloworld`
- `remotion-dev/template-prompt-to-video`
- `Mason720/remotion` (manual GitHub Actions render example)

No third-party template source code is vendored here. See `THIRD_PARTY_NOTICES.md`.

## Remote request contract

A request is a small JSON object. V1 intentionally does not define a general-purpose animation DSL.

```json
{
  "request_id": "example-001",
  "composition": "ImageMotion",
  "props": {
    "imageUrl": "https://example.com/image.jpg",
    "motion": "push-in",
    "backgroundColor": "#111111",
    "width": 1920,
    "height": 1080,
    "fps": 30,
    "durationFrames": 150
  },
  "output": {
    "codec": "h264"
  }
}
```

For V1, external image assets must be reachable by the GitHub-hosted runner using `https://`. The workflow does not upload binary assets from the VPS.

## Trigger from a VPS

The caller should:

1. Serialize the JSON request with stable UTF-8 bytes.
2. Compute SHA-256 of those exact bytes.
3. Base64-encode those exact bytes without line wrapping.
4. Dispatch `.github/workflows/render.yml` with:
   - `request_id`
   - `request_b64`
   - `request_sha256`
5. Poll the workflow run whose display title is `render-<request_id>`.
6. Download the uploaded artifact.
7. Verify `request.json`, `evidence.json`, and `video.mp4`.

Example using GitHub CLI:

```bash
REQ=contracts/smoke-request.json
RID=$(python3 -c 'import json; print(json.load(open("'$REQ'"))["request_id"])')
SHA=$(sha256sum "$REQ" | awk '{print $1}')
B64=$(base64 -w0 "$REQ")

gh workflow run render.yml \
  --repo shasitianshi-cloud/remotion \
  -f request_id="$RID" \
  -f request_b64="$B64" \
  -f request_sha256="$SHA"
```

The repository also contains `clients/vps_client.py` as a reference client for later VPS integration. It is not a daemon and does not store credentials.

## Local development

```bash
npm install
npm run dev
```

Render the smoke request locally:

```bash
npm run render:request -- contracts/smoke-request.json
```

Production policy for the intended deployment is to render on GitHub Actions, not on the small VPS.

## Output artifact

Each successful run uploads an artifact containing:

```text
out/
  video.mp4
  request.json
  evidence.json
```

`evidence.json` includes request hash, repository commit, output hash, byte size, codec, dimensions, frame rate, duration, and remote-render markers.

## Version pinning

Remotion packages are pinned to the same exact version. Remotion recommends keeping all `remotion` and `@remotion/*` packages aligned.

## License note

This repository is a wrapper/runtime project. Remotion has its own licensing terms, including commercial licensing requirements in some circumstances. Review the current Remotion license before production/commercial use.
