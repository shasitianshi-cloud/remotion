# Third-party references

This repository is an original thin remote-runtime wrapper around Remotion.

Architecture and usage were informed by public examples including:

- Remotion official starter template: `remotion-dev/template-helloworld`
- Remotion AI video template: `remotion-dev/template-prompt-to-video`
- CI render example: `Mason720/remotion`

No source code from the repositories above is vendored here.

## React Video Editor Remotion Templates

Runtime V2 content compositions adapt implementation patterns from:

- Repository: `reactvideoeditor/remotion-templates`
- Source commit: `6209b724798e48ff395f8df1a6fa2d26082372b5`
- License: MIT
- Source templates:
  - `templates/text-highlight.tsx`
  - `templates/stat-counter.tsx`
  - `templates/comparison-chart.tsx`
  - `templates/progress-steps.tsx`

The local versions are parameterized adaptations for the remote request contract rather than byte-for-byte copies. Attribution comments are retained in each adapted composition.

## Remotion

Remotion packages are installed from npm. Remotion uses its own license terms and may require a company license in some commercial circumstances. The runtime operator is responsible for reviewing the current Remotion license before production use.
