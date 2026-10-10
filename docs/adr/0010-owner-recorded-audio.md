# 0010. Owner-recorded audio for enabled languages

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D10, `docs/planning/research/architect.md` §8

## Context

Every prompt is voiced. Amazon Polly has no he-IL voice and only Standard Russian voices. Hebrew TTS without niqqud also misreads mathematical words.

## Decision

- For a language with status `enabled`, every phrase has a recording by the owner. `audio:check` is strict in CI; the Web Speech fallback is allowed only for `beta` languages.
- Azure he-IL Neural may be used only for drafts (to hear a text before recording); it never ships.
- Pipeline (WP-09): phrase script → recording checklist → recording → trim + loudnorm −16 LUFS → hashed file name → `public/audio` (MP3 in git); WAV sources in a versioned S3 bucket in `il-central-1`, served through CloudFront.

## Rejected alternatives

- **Polly or another TTS in production:** no Hebrew voice, and wrong readings without niqqud.

## Consequences

- 150–300 phrases per language: 3–5 hours of recording per language, outside the development budget.
