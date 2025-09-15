## Future roadmap: login and user-specific features

This document outlines a scoped, privacy-conscious plan to introduce authentication and per-user capabilities without changing the current default (stateless, stream-only) flow.

### Goals
- Enable login for gated features (e.g., private Facebook, higher limits).
- Keep anonymous streaming working as-is, with strict global rate limits.
- Minimize storage and PII; encrypt sensitive data at rest and in transit.

### Phase 1 – Authentication foundation
1) Identity and sessions
   - Auth: JWT-based auth with short-lived access tokens and refresh tokens.
   - Providers: email/password (bcrypt), plus optional OAuth (Google) later.
   - Secrets: store JWT secrets/keys in env/secret manager.
2) Users table (minimal)
   - id (uuid), email (unique), password_hash (nullable for social), created_at, last_login_at, role (user/admin), is_active.
3) Roles and limits
   - Role-based rate limits: per-user caps for streaming starts/minute and total daily bandwidth.
   - Admin role to view metrics and manage blocks.

### Phase 2 – User settings and private sources
1) Facebook cookies per user (optional)
   - User may upload Netscape cookies.txt (restricted to facebook.com) for private videos.
   - Storage: encrypted at rest (AES-256-GCM) with key from KMS/env; per-user scoped.
   - Validation: scan file type and size; auto-expire/rotate after N days.
   - Streaming: backend passes user’s cookies only for the current request.
2) Download/stream preferences
   - Preferred quality default (e.g., 720p/best).
   - “Stream only” enforced by default; save-to-server only if enabled by admin policy.

### Phase 3 – User history and library (stream-only)
1) History (no files stored)
   - Persist metadata of recent streams: url, platform, title, quality, size_estimate, timestamp.
   - Allow user to re-stream quickly.
2) Favorites / collections
   - User can bookmark items (store metadata only, not the media).

### Phase 4 – Admin and observability
1) Admin dashboard
   - Metrics: streams/day, bandwidth, top platforms, error rates, average time to first byte.
   - User management: deactivate/reactivate, reset roles, revoke tokens.
2) Audit logs
   - Append-only log of privileged actions and authentication events.

### Security & privacy practices
- Never store raw passwords; use bcrypt with strong cost factor.
- Encrypt sensitive columns (cookies, OAuth tokens) with key rotation plan.
- Strict CORS; CSRF protection for cookie-based flows (if used).
- Input validation and sanitization on all endpoints.
- PII minimization: collect only what’s needed; set retention windows.

### Technical notes
- Backend: keep Express; add a small auth module (passport or custom middleware).
- DB: PostgreSQL (users, sessions/refresh tokens, history, favorites, cookies meta).
- Caching: optional Redis for rate limits and session invalidation.
- Migrations: Prisma/Knex type-safe migrations.
- CI/CD: lint, type-check, minimal integration tests for auth + streaming.

### Out of scope (for now)
- Permanent file storage for users (keeps server storage low).
- Public listings/sharing of user libraries.
- Complex subscription/billing.

### Milestones (estimate)
1) Auth core (JWT, users, roles, limits): 2–3 days
2) Cookies per-user (encrypted) + private FB support: 1–2 days
3) History/favorites (metadata only): 1–2 days
4) Admin dashboard (metrics + user mgmt): 2–4 days

This plan keeps the current streaming-only model intact while enabling opt-in, user-specific enhancements safely and incrementally.


