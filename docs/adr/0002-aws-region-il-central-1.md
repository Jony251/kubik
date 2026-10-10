# 0002. AWS region `il-central-1` for personal data

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D2, `docs/planning/research/architect.md` §8

## Context

The target users are families in Israel. Keeping their data in Israel simplifies compliance with Amendment 13 of the Privacy Protection Law. This is an architectural choice, not a legal requirement; a lawyer confirms the details.

## Decision

Everything that holds or may hold personal data runs in `il-central-1` (Tel Aviv): RDS, the API host, backups, CloudWatch Logs and the origin buckets.

- `il-central-1` is an opt-in region and must be enabled on the account.
- The ACM certificate for CloudFront is issued in `us-east-1`, whatever the origin region.
- CloudFront is global and serves an S3 origin in `il-central-1` as usual.
- Sentry receives no personal data and is listed in the privacy policy as a processor.

## Rejected alternatives

- **`eu-central-1`** and **`us-east-1`**: cheaper (prices in `il-central-1` are usually 10–25% higher, not yet verified), but data would leave Israel.

## Consequences

- WP-10 starts by checking that `t4g` instances, PostgreSQL 17 and SES are available in the region; if Graviton is missing, `t3.micro`/`db.t3.micro` are used.
- If SES is not available in `il-central-1`, it is used from `eu-central-1` for sending only, and the privacy policy says so.
