# Runtime V2 Content Base

This branch adds four reusable compositions aimed at narration-driven knowledge, tutorial, documentary, and educational content.

## Composition roles

| Composition | Narrative role | Typical use |
|---|---|---|
| `TextHighlight` | Hook / claim emphasis | Highlight a contradiction, key phrase, or conclusion from narration |
| `StatCounter` | Evidence / surprising fact | Present one verified number as a visual beat |
| `ComparisonChart` | Contrast / before-after | Compare two states, explanations, systems, or outcomes |
| `ProgressSteps` | Mechanism / process | Show a causal sequence or a small number of ordered steps |

`ImageMotion` remains available for photographic or generated-image B-roll.

## Design principle

The runtime does not decide which scene to use. Upstream content or visual planning chooses a narrative role and supplies validated props. These compositions only render deterministic motion graphics.

Recommended selection language:

- `HOOK_CLAIM` -> `TextHighlight`
- `QUANTIFIED_EVIDENCE` -> `StatCounter`
- `CONTRAST` -> `ComparisonChart`
- `MECHANISM_SEQUENCE` -> `ProgressSteps`
- `IMAGE_BROLL` -> `ImageMotion`

## Contract

Use `contracts/render-request-v2.schema.json`.

All compositions accept `width`, `height`, `fps`, and `durationFrames`, and are rendered remotely through the existing GitHub Actions runtime.

## Source provenance

The four new compositions are parameterized adaptations of MIT-licensed examples from `reactvideoeditor/remotion-templates` pinned to commit `6209b724798e48ff395f8df1a6fa2d26082372b5`. See `THIRD_PARTY_NOTICES.md`.
