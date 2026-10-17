-- BizPilot AI schema: business workspaces, profiles and business data tables.
-- Runs on Supabase (Postgres). RLS policies live in the follow-up migration.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Workspaces: one business per user, one profile per user.
-- The handle_new_user trigger (below) creates both on signup.
-- ---------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references auth.users (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  contact_email text,
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'GBP')),
  notify_follow_ups boolean not null default true,
  notify_invoices boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  full_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_business_id_idx on public.profiles (business_id);

-- ---------------------------------------------------------------------------
-- Business data
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 120),
  company text check (company is null or char_length(company) <= 120),
  email text check (email is null or char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  status text not null default 'active' check (status in ('active', 'inactive')),
  total_spend numeric(12, 2) not null default 0 check (total_spend >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index customers_business_id_idx on public.customers (business_id);

create table public.quotations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  number text not null check (char_length(number) between 1 and 40),
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'declined')),
  valid_until date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index quotations_business_number_key on public.quotations (business_id, number);
create index quotations_customer_id_idx on public.quotations (customer_id);

create table public.quotation_items (
  id uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index quotation_items_quotation_id_idx on public.quotation_items (quotation_id);
create index quotation_items_business_id_idx on public.quotation_items (business_id);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  number text not null check (char_length(number) between 1 and 40),
  status text not null default 'draft' check (status in ('draft', 'pending', 'paid', 'overdue')),
  amount numeric(12, 2) not null default 0 check (amount >= 0),
  issued_at date not null default current_date,
  due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index invoices_business_number_key on public.invoices (business_id, number);
create index invoices_customer_id_idx on public.invoices (customer_id);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  description text not null check (char_length(btrim(description)) between 1 and 200),
  quantity numeric(12, 3) not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  created_at timestamptz not null default now()
);

create index invoice_items_invoice_id_idx on public.invoice_items (invoice_id);
create index invoice_items_business_id_idx on public.invoice_items (business_id);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.customers (id) on delete restrict,
  subject text not null check (char_length(btrim(subject)) between 1 and 200),
  notes text not null default '',
  status text not null default 'open' check (status in ('open', 'completed')),
  completed_at timestamptz,
  due_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint follow_ups_completed_requires_completed_at
    check (status <> 'completed' or completed_at is not null)
);

create index follow_ups_business_id_idx on public.follow_ups (business_id);
create index follow_ups_business_status_idx on public.follow_ups (business_id, status);
create index follow_ups_customer_id_idx on public.follow_ups (customer_id);

-- ---------------------------------------------------------------------------
-- Triggers: keep updated_at fresh and bootstrap a workspace on signup.
-- ---------------------------------------------------------------------------

create trigger set_businesses_updated_at
  before update on public.businesses
  for each row execute function public.set_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_customers_updated_at
  before update on public.customers
  for each row execute function public.set_updated_at();

create trigger set_quotations_updated_at
  before update on public.quotations
  for each row execute function public.set_updated_at();

create trigger set_invoices_updated_at
  before update on public.invoices
  for each row execute function public.set_updated_at();

create trigger set_follow_ups_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

-- Every new auth user gets their own business workspace and profile.
-- Names come from the metadata passed at signup.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  workspace_id uuid;
begin
  insert into public.businesses (owner_id, name, contact_email)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data ->> 'business_name'), ''), 'My Business'),
    new.email
  )
  returning id into workspace_id;

  insert into public.profiles (id, business_id, full_name)
  values (
    new.id,
    workspace_id,
    coalesce(btrim(new.raw_user_meta_data ->> 'full_name'), '')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
