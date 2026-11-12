-- Optional production-path schema for Supabase PostgreSQL.
-- This prototype ships without credentials and uses its local demo adapter by default.
create extension if not exists pgcrypto;

create type public.careflow_role as enum ('patient','staff','provider','admin');
create table public.users (id uuid primary key default gen_random_uuid(), auth_user_id uuid unique, email text not null unique, role public.careflow_role not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.clinics (id uuid primary key default gen_random_uuid(), name text not null, city text not null, state text not null default 'AR', rural boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.patient_profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), display_name text not null, city text, state text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.staff_profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), clinic_id uuid references public.clinics(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.provider_profiles (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), specialty text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.providers (id uuid primary key default gen_random_uuid(), profile_id uuid references public.provider_profiles(id), display_name text not null, specialty text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.provider_locations (id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id), clinic_id uuid not null references public.clinics(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.appointment_types (id uuid primary key default gen_random_uuid(), name text not null, format text not null, duration_minutes integer not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.appointment_slots (id uuid primary key default gen_random_uuid(), provider_id uuid not null references public.providers(id), clinic_id uuid not null references public.clinics(id), appointment_type_id uuid references public.appointment_types(id), starts_at timestamptz not null, format text not null, distance_miles numeric, status text not null default 'open', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.care_requests (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), concern text not null, duration text, navigation_category text, emergency_warning boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.intake_sessions (id uuid primary key default gen_random_uuid(), care_request_id uuid not null references public.care_requests(id), status text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.intake_responses (id uuid primary key default gen_random_uuid(), session_id uuid not null references public.intake_sessions(id), field text not null, value jsonb not null, source text not null default 'patient', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.appointments (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), slot_id uuid not null references public.appointment_slots(id), care_request_id uuid references public.care_requests(id), status text not null, preparation_percent integer not null default 0 check (preparation_percent between 0 and 100), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.patient_forms (id uuid primary key default gen_random_uuid(), name text not null, clinic_id uuid references public.clinics(id), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.form_responses (id uuid primary key default gen_random_uuid(), form_id uuid not null references public.patient_forms(id), patient_id uuid not null references public.patient_profiles(id), status text not null, response jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.insurance_profiles (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), plan_name text, member_id_last4 text, verification_status text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.waitlist_entries (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), appointment_type_id uuid references public.appointment_types(id), availability jsonb, max_distance_miles numeric, status text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.notifications (id uuid primary key default gen_random_uuid(), user_id uuid not null references public.users(id), title text not null, body text not null, read boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.staff_tasks (id uuid primary key default gen_random_uuid(), clinic_id uuid references public.clinics(id), patient_id uuid references public.patient_profiles(id), task_type text not null, status text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.provider_briefs (id uuid primary key default gen_random_uuid(), appointment_id uuid not null references public.appointments(id), summary text not null, missing_items jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.audit_logs (id uuid primary key default gen_random_uuid(), actor_user_id uuid references public.users(id), action text not null, resource_type text not null, resource_id uuid, metadata jsonb, created_at timestamptz not null default now());
create table public.accessibility_preferences (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), wheelchair boolean not null default false, hearing_support boolean not null default false, vision_support boolean not null default false, language text, transportation_difficulty boolean not null default false, telehealth_preferred boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.users enable row level security;
alter table public.patient_profiles enable row level security;
alter table public.appointments enable row level security;
alter table public.care_requests enable row level security;
alter table public.intake_responses enable row level security;
alter table public.form_responses enable row level security;
alter table public.insurance_profiles enable row level security;
alter table public.provider_briefs enable row level security;
alter table public.audit_logs enable row level security;

-- Deliberately no permissive RLS policies are installed in the prototype.
-- Production policies must be written and reviewed for each patient/staff/provider boundary.

-- Care discovery and patient-owned record extensions. These tables intentionally
-- remain inaccessible until reviewed RLS policies are installed.
alter table public.clinics add column if not exists address text;
alter table public.clinics add column if not exists postal_code text;
alter table public.clinics add column if not exists latitude double precision;
alter table public.clinics add column if not exists longitude double precision;
alter table public.clinics add column if not exists directory_source text;
alter table public.clinics add column if not exists verified_at timestamptz;

create table if not exists public.patient_preferences (id uuid primary key default gen_random_uuid(), patient_id uuid not null unique references public.patient_profiles(id), location text, postal_code text, specialty text, radius_miles numeric not null default 100 check (radius_miles between 1 and 500), format text not null default 'Either', preferred_days jsonb not null default '[]'::jsonb, time_range text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.medical_records (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), category text not null, title text not null, details text, occurred_at date, source text not null default 'patient-entered', clinician_locked boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.medical_documents (id uuid primary key default gen_random_uuid(), patient_id uuid not null references public.patient_profiles(id), storage_key text not null unique, name text not null, category text not null, mime_type text not null, size_bytes bigint not null check (size_bytes > 0), source text not null default 'patient-uploaded', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists public.appointment_status_history (id uuid primary key default gen_random_uuid(), appointment_id uuid not null references public.appointments(id), status text not null, actor_user_id uuid references public.users(id), note text, created_at timestamptz not null default now());

alter table public.patient_preferences enable row level security;
alter table public.medical_records enable row level security;
alter table public.medical_documents enable row level security;
alter table public.appointment_status_history enable row level security;
