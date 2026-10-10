# 0012. Serverless ingest in Phase 1A

- **Status:** Accepted
- **Date:** 2026-10-06
- **Source:** D12, `docs/planning/research/architect.md` §8

## Context

Phase 1A needs a waitlist and anonymous metrics for the pilot and the case study, long before the 1B API exists.

## Decision

A separate bounded context, `apps/ingest`: two TypeScript Lambda functions (Function URL with OAC behind the same CloudFront, path `/api/ingest/*`) and DynamoDB (on-demand, PITR) in `il-central-1`. zod schemas are shared with `packages/shared`.

- **Waitlist:** adults only; explicit consent; double opt-in through SES; the unsubscribe link deletes the record.
- **Events:** no ids, cookies or IP addresses. Only atomic counters (day × event × bucket). Pilot retention is counted per pilot code (day × code), given with consent on the waitlist.
- **Protection:** reserved concurrency 5, a request body size limit, an event allowlist; no WAF.
- **Cost:** about $0 within the always-free Lambda and DynamoDB limits; no API Gateway.
- In 1B the context stays serverless; the Express API does not accept ingest.

## Rejected alternatives

- **mailto only:** nowhere to keep pilot metrics.
- **Bringing WP-15, WP-17 and EC2 forward:** about 23 hours and early database operations.
- **CloudFront logs + Athena:** time to first question and retention cannot be computed from logs without identifiers.

## Consequences

- WP-22 (ingest in the API) is cancelled.
