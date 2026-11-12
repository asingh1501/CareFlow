# CareFlow AR implementation audit

CareFlow remains a **synthetic demonstration application** until real authentication, a reviewed production database, provider-directory licensing/verification, scheduling partners, and vendor/compliance agreements are supplied. Demo providers and appointments are never represented as live or verified.

## Execution checklist

- [x] Audit framework, routes, state, APIs, database schemas, tests, and interactive controls.
- [x] Add coordinate-based, cross-state provider discovery with a 100-mile default.
- [x] Add ZIP/city validation, specialty/format filters, distance sorting, favorites, details, loading, empty, and error states.
- [x] Add a secure server-only OpenAI adapter, request validation, deterministic safety interception, request limits, rate limiting, timeout handling, and missing-key behavior.
- [x] Replace the fixed intake questionnaire with a natural multi-turn chat and an explicitly labeled deterministic demo mode.
- [x] Implement appointment-preference editing, validation, reset, persistence, and recommendation refresh.
- [x] Add patient profile navigation and functional personal, history, labs, exams, appointments, documents, and settings sections for the synthetic demo account.
- [x] Replace inert patient-facing controls with routes, working state changes, or explicitly disabled unsupported actions.
- [x] Repair record-specific staff/provider routing, staff patient search, upload lifecycle, profile persistence, task resolution, and synthetic waitlist state.
- [x] Add Playwright desktop/mobile coverage for all user-facing routes and critical interactive workflows.
- [x] Extend database schemas for preferences, coordinates, medical records, documents, and appointment requests.
- [ ] Connect production authentication and reviewed role/ownership policies. **Blocked: no identity provider or Supabase credentials.**
- [ ] Connect a licensed/authoritative provider and facility directory. **Needs external service and verification policy.**
- [ ] Confirm real appointment availability/booking. **Needs scheduling partner; the app creates demo requests only.**
- [ ] Verify live OpenAI responses. **Needs `OPENAI_API_KEY`; code and mocked tests are complete.**

## Feature audit

| Feature | Initial issue | Files changed | Actual implementation | Testing | Status |
|---|---|---|---|---|---|
| Provider discovery | Arkansas-only types and fixed distances | `lib/providers/*`, `app/api/providers/search/route.ts`, `app/patient/providers/page.tsx` | Haversine search over a clearly labeled synthetic directory; ZIP/city origin; specialty, radius, format, sort, favorites, details | Unit/route tests; UI compiled in production build | Working (demo data) |
| Cross-state 100-mile search | Same-state assumptions | `lib/providers/directory.ts`, `lib/providers/search.ts` | Fayetteville/Bentonville-area searches include qualifying Missouri and Oklahoma entries by distance | Boundary tests | Working (demo data) |
| Find Care AI | No external AI adapter; fixed prompt chips | `app/api/ai/*`, `app/patient/intake/page.tsx`, `lib/ai/*` | Natural multi-turn chat, secure OpenAI SDK server route, explicit demo fallback, reset/retry/loading/autoscroll, structured care-request extraction | Successful/failed upstream mocks, missing-key, safety, validation, and rate-limit tests | Needs Credentials for live AI |
| AI safety | Only narrow client-side behavior | `lib/ai/safety.ts`, `app/api/ai/chat/route.ts` | Deterministic emergency interception runs before model calls; navigation-only system policy | Unit tests | Working |
| Appointment preferences | Button did nothing | `components/preferences-dialog.tsx`, `app/patient/appointments/page.tsx`, demo state | Validated specialty/location/radius/time/day/format editor, reset/cancel/save, persisted demo state, immediate refresh | Typecheck/lint/production render build | Working (demo persistence) |
| Appointment lifecycle | Buttons implied confirmed live booking | appointment pages and demo state | New actions create clearly labeled demo requests; detail view supports cancel confirmation and status; no live availability claims | Typecheck/lint/production render build | Working (demo workflow); Needs External Service for live confirmation |
| Patient profile | Route and records absent | `app/patient/profile/page.tsx`, demo state, schema | Responsive tabbed profile; user-entered CRUD; labs/exams/documents empty states; settings/logout behavior; clear synthetic-data boundary | Typecheck/lint/production render build | Working (demo persistence) |
| Document handling | No upload workflow | profile page, `app/api/documents/route.ts` | Server-side type/size/name validation and session-scoped demo metadata; no public URLs | Route validation tests | Working (demo session); production storage blocked |
| Navigation/buttons | Avatar, notifications, patient routing, and several staff actions were inert or misleading | shared shell, patient/staff/provider pages | Record-specific routing, functional filtering and demo state changes, notification panel, routed actions, and clearly disabled external-only controls | Playwright desktop/mobile browser suite | Working where supported |
| Browser QA | No repeatable interaction coverage | `playwright.config.ts`, `tests/e2e/*` | Route sweep, console/page-error capture, desktop workflows, persistence, uploads, filters, dialogs, safety, and mobile layout | 9/9 Playwright tests passed | Working |
| Production persistence | D1 global demo state only; Supabase schema incomplete | `db/schema.ts`, `supabase/schema.sql` | Model coverage added; production adapter still intentionally not claimed | Build/typecheck | Needs Credentials / security review |

## External setup required

Create `.env.local` (never commit it):

```text
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`OPENAI_API_KEY` is read only by the server route. A live provider directory and scheduling partner require separate owner-selected services, contract/terms review, identity matching, and association/availability verification. NPI data alone must not be used to claim hospital affiliation, network participation, accepting-patient status, or appointment availability.

## Pre-production requirements

Formal privacy/security threat modeling, authentication and authorization review, database/storage RLS tests, audit/retention policy, encryption review, accessibility testing, clinical safety governance, vendor BAAs where applicable, incident response, legal review, and compliance assessment remain required. This repository does not claim HIPAA compliance.

## Verification completed

- `npx tsc --noEmit` — passed.
- `npm run lint` — passed.
- `npm test` — Vinext production build passed; 16/16 domain/API tests passed.
- `npm run test:e2e` — 9/9 Playwright tests passed across desktop and mobile Chromium; all 23 user-facing routes returned successfully without captured page or console errors.
- `npx next build` — passed using the Vercel-configured Next.js build path.
- `npm audit --omit=dev` — 0 production vulnerabilities after upgrading Next.js and patched Undici.
- The compatible React/React DOM/React Server Components 19.2.9 security patch was applied. Full `npm audit` still reports 22 development-tool advisories in the pinned Vinext/Cloudflare/Vite/Drizzle toolchain; npm only offers breaking changes for the remaining paths, so they were not force-applied. `npm audit --omit=dev` reports 0 production vulnerabilities.
- The optimized Next.js server returned HTTP 200 for `/`, `/patient/profile`, and provider search; `/api/ai/status` correctly reported that live AI credentials are not configured.
