# 0005. Rubik as the single self-hosted typeface

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D5, `docs/planning/research/architect.md` §8

## Context

The UI mixes Latin, Cyrillic and Hebrew with children's niqqud. The typeface must render every vowel mark correctly.

## Decision

Use Rubik (variable, OFL), self-hosted, as the only typeface. Its cmap covers U+05B0–U+05C7 and its GPOS `mark` feature positions every vowel used in children's niqqud, plus Latin and Cyrillic (checked with fontTools). `'Noto Sans Hebrew'` stays in the font stack as a fallback for rare marks and loads lazily via `unicode-range`.

## Rejected alternatives

- **Nunito + Noto Sans Hebrew:** two typefaces cost more bytes and give an uneven rhythm.

## Consequences

- A visual niqqud test stays in the WP-04 Definition of Done.
- Font subsets have a size budget in CI (WP-02).
