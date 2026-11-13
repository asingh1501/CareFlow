# CareFlow AR

CareFlow AR is a polished full-stack prototype for the work that happens **before** a healthcare appointment. It guides a patient from a plain-language care request through conservative care navigation, transparent appointment matching, booking, and digital preparation. The same workflow gives clinic staff an operations view and gives providers a concise patient-reported pre-visit brief.

The initial concept is focused on healthcare access in Arkansas while supporting distance-based care discovery across state borders, including rural access, travel distance, telehealth, accessibility, and transportation preferences.

> CareFlow AR is a student healthcare innovation prototype. It is not a medical device or diagnostic system. It does not diagnose, prescribe, replace clinicians or emergency services, determine clinical priority, or guarantee that a care setting is appropriate. All people, clinics, providers, insurance plans, addresses, and metrics are fictional or simulated.

## What the prototype demonstrates

- Conversational intake that progressively creates structured data
- Deterministic emergency-warning interruption, separate from generative AI
- Care navigation categories with plain-language explanations
- A 0–100 appointment matching engine using visit fit, availability, distance, format, accessibility, sample insurance compatibility, and soonness
- Appointment booking and a seven-step pre-visit checklist
- Digital demographic, medication, allergy, history, insurance, accessibility, and acknowledgment forms
- Patient dashboard, messages, waitlist offer, and mobile navigation
- Staff operations dashboard, preparation statuses, task queue, patient detail, and cancellation recovery
- Supportive no-show workflows that add reminders or assistance without denying or deprioritizing care
- Provider schedule and patient-reported pre-visit brief
- Simulated clinic operations analytics with explicit labels
- A presentation mode that links every stage of the Jordan Lee demo story
- Responsible AI, privacy, bias, transparency, oversight, data minimization, and accessibility guidance

## Technology

- Next.js App Router, React, and TypeScript
- Tailwind CSS plus a custom design system in `app/globals.css`
- Lucide icons and Recharts
- Next.js route handlers for intake, matching, summarization, and demo-state persistence
- Drizzle ORM schema and Cloudflare D1 for the deployable no-credential demo adapter
- Optional Supabase PostgreSQL schema for the intended production path

The hosted prototype uses D1 because it can run immediately without external credentials. The domain and integration boundaries are intentionally portable to Supabase. `supabase/schema.sql` contains a PostgreSQL/UUID schema with row-level security enabled and no unsafe permissive policies. A production Supabase implementation should replace the demo repository adapter, not the business rules.

## Hosted application

The verified production deployment is available at [careflow-ar.vercel.app](https://careflow-ar.vercel.app). It runs in clearly labeled demonstration mode unless production service credentials and reviewed data integrations are configured.

## Architecture

```text
app/
  api/                    Server-side intake, matching, summary, demo-state routes
  patient/                Patient intake, scheduling, booking, preparation, waitlist
  staff/                  Operations, patients, schedule, waitlist, task queue
  provider/               Provider schedule and pre-visit brief
  analytics/              Simulated operational analytics
  responsible-ai/         Safety, privacy, and responsible-use explanation
components/               Shared shell, navigation, metrics, tables, status, progress
lib/
  ai/                     Extraction, care navigation, missing-info, summarization
  scheduling/             Transparent appointment scoring and ranking
  integrations/           Future EHR, calendar, eligibility, and notification contracts
db/                       Drizzle schema and fictional D1 seed data
drizzle/                  Generated D1 migration
supabase/                 Optional PostgreSQL schema for a future Supabase adapter
```

### Safety flow

```text
Patient message
  → deterministic structured extraction
  → deterministic emergency-warning rules
  → conservative care-navigation category
  → human-readable explanation
  → human/provider review and clinical control
```

Generative AI is never the sole emergency screen. The demo checks a small, explicit set of warning phrases and interrupts automated scheduling. These rules are demonstration logic, not clinically validated triage rules; a real product would require clinician-designed protocols, validation, monitoring, and governance.

### Appointment score

`lib/scheduling/match.ts` keeps ranking separate from the interface. The normalized score combines:

- Care/appointment type match
- Stated availability
- Visit-format preference
- Sample insurance compatibility
- Distance or telehealth
- Appointment soonness
- Accessibility compatibility

Patients see plain-language reasons such as “Fits your preferred time” and “Insurance match,” not the weighting details. This score is for scheduling convenience only and must not be used to deny care or establish clinical priority.

## Database design

The Drizzle and optional Supabase schemas include:

- `users`, `patient_profiles`, `staff_profiles`, `provider_profiles`
- `clinics`, `providers`, `provider_locations`
- `appointment_types`, `appointment_slots`, `appointments`
- `care_requests`, `intake_sessions`, `intake_responses`
- `patient_forms`, `form_responses`, `insurance_profiles`
- `waitlist_entries`, `notifications`, `staff_tasks`
- `provider_briefs`, `audit_logs`, `accessibility_preferences`

IDs are UUID-ready/text UUIDs, relationships are explicit, and operational tables include creation/update timestamps where appropriate. The D1 migration is generated in `drizzle/`; the fictional seed file is `db/seed.sql`.

Seed data includes 10 patients, 5+ providers, 5 clinics, 24 appointment slots, four waitlist entries, and five staff tasks. The UI also includes Casey Hughes, APRN as a sixth demo provider. Do not add real patient data.

## Run locally

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

Open the local URL printed by the development server. The application works without environment variables.

Validation commands:

```bash
npx tsc --noEmit
npm run lint
npm run build
npm run test:e2e
```

The Playwright suite starts or reuses the local server, exercises all 23 user-facing routes, and covers desktop and mobile Chromium workflows. Install its browser runtime once with `npx playwright install chromium`. The HTML result is written to `playwright-report/` and is intentionally ignored by Git.

Generate a migration after changing `db/schema.ts`:

```bash
npm run db:generate
```

For a local D1 database, apply the generated migration and `db/seed.sql` with the Wrangler/D1 workflow used by the host environment. The interface carries a complete deterministic dataset even before seeding, so presentation mode works immediately.

## Environment variables

Copy `.env.example` to `.env.local` only when connecting optional services.

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5-mini
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

- `OPENAI_API_KEY` enables the official server-side OpenAI SDK adapter. It is never exposed to the browser; deterministic emergency-warning rules run before model calls. Without it, Find Care AI clearly identifies its deterministic demo mode.
- `OPENAI_MODEL` selects the server-side model and defaults to `gpt-5-mini`.
- Supabase variables are optional. Never expose the service-role key in client code or commit secrets.
- The prototype contains no real healthcare-system integration.

## Demo mode

Use **Explore demo** on the landing page, or go directly to `/demo`.

Recommended presentation sequence:

1. Open Patient Intake and select **Use Jordan’s demo request**.
2. Review the structured “Your Care Request” panel.
3. Continue to the non-diagnostic primary-care navigation result.
4. Show the ranked appointment cards and their recommendation reasons.
5. Book the 4:20 PM option with Dr. Maya Patel.
6. Complete the pre-visit demo forms; Jordan becomes **Ready**.
7. Switch to Staff View using the dark demo bar and show Jordan’s updated status.
8. Open Jordan’s patient detail and the cancellation/waitlist optimizer.
9. Switch to Provider View and open Jordan’s patient-reported pre-visit brief.
10. Finish on Analytics and emphasize that all metrics are simulated.

The **Reset demo** button restores the starting state. State is written to the D1 demo endpoint when available and mirrored locally for smooth presentation continuity.

## AI implementation

The prototype always works in deterministic fallback mode:

- `intake-extraction.ts`: extracts limited structured fields from plain language
- `care-navigation.ts`: applies conservative non-diagnostic navigation rules
- `missing-information.ts`: identifies incomplete scheduling/intake fields
- `pre-visit-summary.ts`: generates a neutral patient-reported brief

The API responses expose whether the server is in deterministic or enhancement-ready mode. An external LLM adapter should be server-only, schema-validated, logged, monitored, and prohibited from overriding the deterministic safety layer.

## Privacy and security direction

The prototype demonstrates or reserves architecture for:

- Patient/staff/provider role boundaries
- Server-side persistence and integration adapters
- Data minimization and patient-reported labels
- Audit logging for state changes
- Supabase row-level security boundaries
- Secrets kept in environment variables
- No client-side service-role keys

This is **designed with healthcare privacy and security principles in mind; production deployment would require formal security, compliance, legal, and clinical review.** The prototype does not claim to be HIPAA compliant.

## Accessibility

The application uses semantic headings, tables, forms, labels, visible focus states, keyboard-operable patient rows, adequate contrast, reduced-motion support, large touch targets, responsive layouts, and a mobile patient navigation bar. The data model supports wheelchair access, hearing support, vision support, language preference, transportation difficulty, and telehealth preference.

## Future integration boundaries

`lib/integrations/contracts.ts` defines replaceable interfaces for:

- EHR/FHIR exchange
- Real provider calendars
- Insurance eligibility verification
- SMS and email reminders
- Telehealth platforms
- Mapping and travel-time services
- Healthcare provider directories

No real EHR, insurer, calendar, provider directory, or messaging service is contacted by this prototype.

## Prototype limitations

- Demo rules are not clinically validated.
- Providers, clinics, patients, insurance plans, addresses, wait estimates, and metrics are fictional.
- Authentication is simulated with role-entry buttons. Production should use Supabase Auth or an enterprise identity provider, strong authorization checks, and reviewed RLS policies.
- Provider, clinic, and hospital discovery uses an explicitly synthetic offline directory and city-centroid straight-line distances. A licensed directory/geocoding source is still required for verified identities, street addresses, phone numbers, affiliations, and live status.
- The no-show feature is a responsible-workflow demonstration, not a validated prediction model.
- Operational impact is illustrative and must not be presented as measured or proven.
- Production use needs threat modeling, encryption review, consent and retention policies, accessibility testing, clinical safety review, incident response, legal review, and compliance assessment.
