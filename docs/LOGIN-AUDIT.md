# Login audit — 2026-09-09

Scope: the current working tree, browser build, installed Supabase SDK, and live
Supabase project `fqwjcacuxsumqpmdsfxc` (`neon coach - 3ed`). Earlier changes from
the application repair request were already present when the five-point audit
was requested. Findings were reported before the following additional fixes.

| Check | Finding before these additional fixes | Action |
| --- | --- | --- |
| Public environment secrets | No populated service-role/secret key found. The configured legacy JWT has role `anon`. The example advertised empty VITE AI-secret variables. | Removed those examples, restricted public variables, rejected privileged keys at build time and client initialization. |
| Request-supplied identity/role | No current custom API route/server action trusts a submitted identity. `save_user_state` derives ownership from `auth.uid()`. RLS enforces ownership; coach authorization uses server-managed app metadata. | No additional change. |
| RLS disabled/missing policies | All 16 public tables have RLS and a policy. Storage objects have an ownership policy. Seven managed storage metadata tables have RLS without policies, denying client access. | No additional change. |
| Browser-only logout | SDK already invokes the server logout endpoint with local scope (the current server session). Application state cleared before the response. | Await server logout, handle returned/thrown errors, clear application state after success. SDK itself may clear local storage on a network error; failure is not reported as confirmed server logout. |
| Email enumeration messages | Signup distinguished duplicate identities, login distinguished unconfirmed accounts, and reset error responses could differ. | Unified account-related login failures; matching signup/reset response shapes and wording, including account-specific delivery errors. |

Each fix was completed and tested before starting the next one.

Validation:

- Unit tests reject service-role JWTs, secret keys, malformed keys, and public
  secret variables without echoing their values.
- Auth tests cover invalid credentials, offline failures, signup confirmation,
  duplicate-account responses, unconfirmed/banned/unknown accounts, reset
  delivery errors, expired/forged sessions, late hydration, and logout failures.
- A real temporary account logged in through Supabase. After logout, its exact
  session no longer existed in `auth.sessions`, and no active refresh token
  remained for that session.
- Live settings confirm email confirmation is enabled (`mailer_autoconfirm=false`).
- `tests/rls.sql` passed against the live database in a rolled-back transaction:
  cross-account reads/writes, role promotion, coach self-assignment, private photo
  writes, anonymous access, and stale-revision conflicts.

Limits:

- This is application-message normalization, not proof that direct Supabase Auth
  API responses, email delivery, or timing cannot reveal information.
- Supabase access tokens already issued remain valid until expiration, even after
  the session and refresh tokens are revoked. Current RLS checks ownership, not
  `auth.sessions` membership. See [Supabase sign-out documentation](https://supabase.com/docs/guides/auth/signout).
- The remaining Supabase advisor warning is disabled leaked-password protection.
  This requires an Auth setting change; the connected tools do not expose an Auth
  configuration update operation. See [password security](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).
- The frontend changes are local and built into `dist`; no frontend hosting
  deployment was performed.
