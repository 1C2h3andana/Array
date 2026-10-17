-- Row Level Security for BizPilot AI.
-- Every business-owned row is readable/writable only by members of its business.
-- The app connects with the anon key; authenticated access is mediated by
-- auth.uid() and the caller's profile. The service-role key is never used in
-- the browser and bypasses these policies only in trusted server contexts.

alter table public.businesses enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.quotations enable row level security;
alter table public.quotation_items enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.follow_ups enable row level security;

-- Resolves the caller's workspace once. Security definer so policy checks do
-- not recurse through the profiles policies.
create or replace function public.user_business_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select business_id from public.profiles where id = auth.uid()
$$;

revoke execute on function public.user_business_id() from public, anon;
grant execute on function public.user_business_id() to authenticated;

-- Businesses: visible and editable only by their owner.
create policy businesses_select_own on public.businesses
  for select to authenticated
  using (owner_id = auth.uid());

create policy businesses_insert_own on public.businesses
  for insert to authenticated
  with check (owner_id = auth.uid());

create policy businesses_update_own on public.businesses
  for update to authenticated
  using (owner_id = auth.uid())
  with check (owner_id = auth.uid());

-- Profiles: users see and update their own row, but cannot switch workspace.
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid());

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid() and business_id = public.user_business_id());

-- Business data: all access scoped to the caller's workspace.
create policy customers_workspace_all on public.customers
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());

create policy quotations_workspace_all on public.quotations
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());

create policy quotation_items_workspace_all on public.quotation_items
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());

create policy invoices_workspace_all on public.invoices
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());

create policy invoice_items_workspace_all on public.invoice_items
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());

create policy follow_ups_workspace_all on public.follow_ups
  for all to authenticated
  using (business_id = public.user_business_id())
  with check (business_id = public.user_business_id());
