-- Wealth tracker core schema: one row set per user (auth.users), RLS-scoped.

create extension if not exists pgcrypto;

create function set_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- financial_settings ---------------------------------------------------

create table financial_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  earning_currency text not null default 'USD',
  spending_currency text not null default 'USD',
  manual_exchange_rate_enabled boolean not null default false,
  manual_exchange_rate numeric,
  cached_exchange_rate numeric not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger financial_settings_set_updated_at
  before update on financial_settings
  for each row execute function set_updated_at();

alter table financial_settings enable row level security;

create policy "select own settings" on financial_settings
  for select using (auth.uid() = user_id);
create policy "insert own settings" on financial_settings
  for insert with check (auth.uid() = user_id);
create policy "update own settings" on financial_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own settings" on financial_settings
  for delete using (auth.uid() = user_id);

-- Every new auth user gets a default settings row.
create function handle_new_user_settings() returns trigger as $$
begin
  insert into financial_settings (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created_settings
  after insert on auth.users
  for each row execute function handle_new_user_settings();

-- income_sources ---------------------------------------------------------

create table income_sources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text not null,
  amount numeric not null,
  currency text not null,
  cadence text not null check (cadence in ('monthly', 'weekly', 'annual', 'one_time')),
  created_at timestamptz not null default now()
);

create index income_sources_user_id_idx on income_sources(user_id);
alter table income_sources enable row level security;

create policy "select own income sources" on income_sources
  for select using (auth.uid() = user_id);
create policy "insert own income sources" on income_sources
  for insert with check (auth.uid() = user_id);
create policy "update own income sources" on income_sources
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own income sources" on income_sources
  for delete using (auth.uid() = user_id);

-- budget_categories --------------------------------------------------------

create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  percentage numeric not null check (percentage >= 0 and percentage <= 100),
  color text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index budget_categories_user_id_idx on budget_categories(user_id);
alter table budget_categories enable row level security;

create policy "select own budget categories" on budget_categories
  for select using (auth.uid() = user_id);
create policy "insert own budget categories" on budget_categories
  for insert with check (auth.uid() = user_id);
create policy "update own budget categories" on budget_categories
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own budget categories" on budget_categories
  for delete using (auth.uid() = user_id);

-- goals ----------------------------------------------------------------

create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric not null,
  current_amount numeric not null default 0,
  currency text not null,
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger goals_set_updated_at
  before update on goals
  for each row execute function set_updated_at();

create index goals_user_id_idx on goals(user_id);
alter table goals enable row level security;

create policy "select own goals" on goals
  for select using (auth.uid() = user_id);
create policy "insert own goals" on goals
  for insert with check (auth.uid() = user_id);
create policy "update own goals" on goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own goals" on goals
  for delete using (auth.uid() = user_id);

-- transactions -----------------------------------------------------------

create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  category_id uuid references budget_categories(id) on delete set null,
  description text not null,
  amount numeric not null,
  currency text not null,
  converted_amount numeric not null,
  date date not null,
  created_at timestamptz not null default now()
);

create index transactions_user_id_idx on transactions(user_id);
create index transactions_category_id_idx on transactions(category_id);
alter table transactions enable row level security;

create policy "select own transactions" on transactions
  for select using (auth.uid() = user_id);
create policy "insert own transactions" on transactions
  for insert with check (auth.uid() = user_id);
create policy "update own transactions" on transactions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own transactions" on transactions
  for delete using (auth.uid() = user_id);

-- assets & liabilities -------------------------------------------------

create table assets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  value numeric not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create index assets_user_id_idx on assets(user_id);
alter table assets enable row level security;

create policy "select own assets" on assets
  for select using (auth.uid() = user_id);
create policy "insert own assets" on assets
  for insert with check (auth.uid() = user_id);
create policy "update own assets" on assets
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own assets" on assets
  for delete using (auth.uid() = user_id);

create table liabilities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  value numeric not null,
  currency text not null,
  created_at timestamptz not null default now()
);

create index liabilities_user_id_idx on liabilities(user_id);
alter table liabilities enable row level security;

create policy "select own liabilities" on liabilities
  for select using (auth.uid() = user_id);
create policy "insert own liabilities" on liabilities
  for insert with check (auth.uid() = user_id);
create policy "update own liabilities" on liabilities
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own liabilities" on liabilities
  for delete using (auth.uid() = user_id);

-- monthly_reviews --------------------------------------------------------

-- `month` is normalized to the first day of the month (e.g. 2026-07-01) for sortability.
create table monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  month date not null,
  planned_spend numeric not null,
  actual_spend numeric not null,
  savings numeric not null,
  notes text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, month)
);

create index monthly_reviews_user_id_idx on monthly_reviews(user_id);
alter table monthly_reviews enable row level security;

create policy "select own monthly reviews" on monthly_reviews
  for select using (auth.uid() = user_id);
create policy "insert own monthly reviews" on monthly_reviews
  for insert with check (auth.uid() = user_id);
create policy "update own monthly reviews" on monthly_reviews
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own monthly reviews" on monthly_reviews
  for delete using (auth.uid() = user_id);

-- exchange_rate_snapshots -------------------------------------------------
-- Shared reference data (market rates), not scoped to a single user. Immutable log: no update/delete policies.

create table exchange_rate_snapshots (
  id uuid primary key default gen_random_uuid(),
  base_currency text not null,
  quote_currency text not null,
  rate numeric not null,
  source text not null check (source in ('api', 'manual', 'cached')),
  captured_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

create index exchange_rate_snapshots_pair_idx on exchange_rate_snapshots(base_currency, quote_currency, captured_at desc);
alter table exchange_rate_snapshots enable row level security;

create policy "select exchange rate snapshots" on exchange_rate_snapshots
  for select using (auth.role() = 'authenticated');
create policy "insert exchange rate snapshots" on exchange_rate_snapshots
  for insert with check (auth.role() = 'authenticated');
