-- Oxyzen: grundschema
-- Kunder (profiles), personal (staff), köpta paket (purchases) och
-- genomförda sessioner (sessions). Row Level Security gör att en kund
-- bara ser sitt eget, och att bara personal kan registrera köp.

create extension if not exists pgcrypto;

-- Personal ----------------------------------------------------------------
create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.staff where user_id = auth.uid());
$$;

-- Kundprofiler ------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  name text not null default '',
  protocol_id text not null default 'deep',
  protocol_started_at timestamptz not null default now(),
  settings jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Skapa profil automatiskt när en användare registreras.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Köpta paket -------------------------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  count integer not null check (count > 0),
  note text,
  created_by uuid references auth.users (id),
  created_at timestamptz not null default now()
);
create index purchases_user_idx on public.purchases (user_id);

-- Sessioner ---------------------------------------------------------------
-- id är text eftersom appen skapar id:t själv (fungerar offline).
create table public.sessions (
  id text primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date timestamptz not null,
  duration_min integer not null check (duration_min > 0),
  pressure numeric(3, 1) not null check (pressure between 1.0 and 3.0),
  cycle text not null default '20/5',
  completed_in_app boolean not null default false,
  checkin jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index sessions_user_date_idx on public.sessions (user_id, date);

-- updated_at --------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger sessions_touch before update on public.sessions
  for each row execute function public.touch_updated_at();

-- Saldo per kund (köpta - genomförda), praktiskt för admin.
create or replace view public.balances
with (security_invoker = true)
as
select
  p.id as user_id,
  p.email,
  p.name,
  coalesce((select sum(count) from public.purchases pu where pu.user_id = p.id), 0) as purchased,
  (select count(*) from public.sessions s where s.user_id = p.id) as done,
  coalesce((select sum(count) from public.purchases pu where pu.user_id = p.id), 0)
    - (select count(*) from public.sessions s where s.user_id = p.id) as remaining
from public.profiles p;

-- Row Level Security ------------------------------------------------------
alter table public.staff enable row level security;
alter table public.profiles enable row level security;
alter table public.purchases enable row level security;
alter table public.sessions enable row level security;

-- staff: bara personal ser listan
create policy "staff read" on public.staff
  for select using (public.is_staff());

-- profiles
create policy "profiles own read" on public.profiles
  for select using (id = auth.uid() or public.is_staff());
create policy "profiles own update" on public.profiles
  for update using (id = auth.uid() or public.is_staff())
  with check (id = auth.uid() or public.is_staff());

-- purchases: kund läser sina, personal gör allt
create policy "purchases own read" on public.purchases
  for select using (user_id = auth.uid() or public.is_staff());
create policy "purchases staff insert" on public.purchases
  for insert with check (public.is_staff());
create policy "purchases staff update" on public.purchases
  for update using (public.is_staff());
create policy "purchases staff delete" on public.purchases
  for delete using (public.is_staff());

-- sessions: kund äger sina, personal ser och kan rätta
create policy "sessions own read" on public.sessions
  for select using (user_id = auth.uid() or public.is_staff());
create policy "sessions own insert" on public.sessions
  for insert with check (user_id = auth.uid() or public.is_staff());
create policy "sessions own update" on public.sessions
  for update using (user_id = auth.uid() or public.is_staff());
create policy "sessions own delete" on public.sessions
  for delete using (user_id = auth.uid() or public.is_staff());
