-- Personal CFO system, Phase 1: schema foundation only.
-- No allocation trigger yet (Phase 2) and no UI changes rely on this beyond
-- keeping the app compiling/functional with sensible defaults.

-- goals: new descriptive/behavioral fields ---------------------------------

alter table goals
  add column description text not null default '',
  add column category text not null default 'custom'
    check (category in ('rent', 'emergency', 'wedding', 'investment', 'business', 'custom')),
  add column priority text not null default 'medium'
    check (priority in ('critical', 'high', 'medium', 'low')),
  add column contribution_percentage numeric not null default 0,
  add column target_type text not null default 'fixed'
    check (target_type in ('fixed', 'ongoing')),
  add column is_auto_funded boolean not null default false;

alter table goals
  add constraint goals_target_amount_check check (target_type = 'ongoing' or target_amount > 0);

-- budget_categories: link to the goal it funds (FK, not a string slug --
-- survives renames and generalizes to custom category/goal pairs) --------

alter table budget_categories
  add column linked_goal_id uuid references goals(id) on delete set null;

create unique index budget_categories_linked_goal_id_key
  on budget_categories(linked_goal_id)
  where linked_goal_id is not null;

-- goal_allocations: insert-only audit log for Phase 2's allocation trigger.
-- Created now so the plumbing (types/mappers/service) exists ahead of time.

create table goal_allocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  transaction_id uuid not null references transactions(id) on delete cascade,
  goal_id uuid not null references goals(id) on delete cascade,
  amount numeric not null,
  created_at timestamptz not null default now()
);

create index goal_allocations_user_id_idx on goal_allocations(user_id);
alter table goal_allocations enable row level security;

create policy "select own goal allocations" on goal_allocations
  for select using (auth.uid() = user_id);

-- transactions: granular category (separate from category_id, the budget bucket) --

alter table transactions
  add column category text;

-- assets: category enum grouped client-side into Financial/Physical/Business ----

alter table assets
  add column category text not null default 'other'
    check (category in (
      'cash', 'bank_account', 'savings', 'investments',
      'solar_system', 'laptop', 'phone', 'car', 'property',
      'domains', 'websites', 'equipment', 'business_cash',
      'other'
    ));

-- liabilities: category enum -----------------------------------------------

alter table liabilities
  add column category text not null default 'other'
    check (category in ('personal_loan', 'car_loan', 'mortgage', 'credit_card_debt', 'money_owed', 'other_debt'));

-- monthly_reviews: expanded reflection fields ------------------------------

alter table monthly_reviews
  add column savings_rate numeric not null default 0,
  add column net_worth_snapshot numeric not null default 0,
  add column what_went_well text not null default '',
  add column what_could_improve text not null default '',
  add column biggest_win text not null default '',
  add column lessons_learned text not null default '',
  add column auto_summary text not null default '';

-- financial_settings: name, emergency-fund inputs, notification/theme prefs --

alter table financial_settings
  add column full_name text,
  add column monthly_living_expenses numeric not null default 500000,
  add column emergency_fund_months numeric not null default 6,
  add column email_alerts_enabled boolean not null default true,
  add column theme text not null default 'system'
    check (theme in ('light', 'dark', 'system'));

-- net_worth_snapshots: daily point-in-time capture, powers the future trend score --

create table net_worth_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  captured_at date not null default current_date,
  total_assets numeric not null,
  total_liabilities numeric not null,
  net_worth numeric not null,
  created_at timestamptz not null default now(),
  unique (user_id, captured_at)
);

create index net_worth_snapshots_user_id_idx on net_worth_snapshots(user_id);
alter table net_worth_snapshots enable row level security;

create policy "select own net worth snapshots" on net_worth_snapshots
  for select using (auth.uid() = user_id);
create policy "insert own net worth snapshots" on net_worth_snapshots
  for insert with check (auth.uid() = user_id);
create policy "update own net worth snapshots" on net_worth_snapshots
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Seed the 5 default goals + link budget categories to them, for new signups --

create or replace function handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_spending_currency text;
  v_rent_goal_id uuid;
  v_emergency_goal_id uuid;
  v_investment_goal_id uuid;
  v_wedding_goal_id uuid;
  v_business_goal_id uuid;
begin
  insert into public.financial_settings (user_id) values (new.id)
  returning spending_currency into v_spending_currency;

  insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded, due_date)
  values (new.id, 'Annual Rent', 'Always have next year''s rent ready.', 'rent', 'critical', 12, 1800000, v_spending_currency, 'active', 'fixed', true, '2027-08-01')
  returning id into v_rent_goal_id;

  insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
  values (new.id, 'Emergency Fund', '6 months of living expenses, ready for emergencies.', 'emergency', 'critical', 12, 3000000, v_spending_currency, 'active', 'fixed', true)
  returning id into v_emergency_goal_id;

  insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
  values (new.id, 'Wedding Fund', 'Save for your future wedding.', 'wedding', 'high', 8, 6000000, v_spending_currency, 'active', 'fixed', true)
  returning id into v_wedding_goal_id;

  insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
  values (new.id, 'Investment Portfolio', 'Ongoing long-term wealth building (ETFs, index funds, etc.).', 'investment', 'high', 20, 0, v_spending_currency, 'active', 'ongoing', true)
  returning id into v_investment_goal_id;

  insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
  values (new.id, 'Business Growth Fund', 'Courses, AI tools, laptop, startup, agency, equipment.', 'business', 'medium', 7, 0, v_spending_currency, 'active', 'ongoing', true)
  returning id into v_business_goal_id;

  insert into public.budget_categories (user_id, name, description, percentage, color, sort_order, linked_goal_id)
  values
    (new.id, '🏠 Rent Fund', 'Save for next year''s rent.', 12, '#2563eb', 1, v_rent_goal_id),
    (new.id, '🚨 Emergency Fund', 'Build until you have 6 months of expenses, then redirect this percentage to investing.', 12, '#dc2626', 2, v_emergency_goal_id),
    (new.id, '📈 Investments', 'Long-term wealth (ETFs, index funds, etc.).', 20, '#16a34a', 3, v_investment_goal_id),
    (new.id, '💍 Wedding Fund', 'Save for your future wedding.', 8, '#db2777', 4, v_wedding_goal_id),
    (new.id, '🍜 Living Expenses', 'Food, transport, utilities, family support, internet, etc.', 38, '#ea580c', 5, null),
    (new.id, '🚀 Business & Self Development', 'Courses, AI tools, your startup, agency, equipment.', 7, '#7c3aed', 6, v_business_goal_id),
    (new.id, '🎉 Lifestyle', 'Entertainment, clothes, eating out, guilt-free spending.', 3, '#0f766e', 7, null);

  return new;
end;
$$;

-- Backfill: existing users with zero goals get the same 5 defaults, and their
-- existing budget_categories get linked_goal_id set by matching current name
-- (best-effort — a category already renamed before this migration ships is a
-- known, accepted gap for this one-time backfill only).

do $$
declare
  u record;
  v_rent_goal_id uuid;
  v_emergency_goal_id uuid;
  v_investment_goal_id uuid;
  v_wedding_goal_id uuid;
  v_business_goal_id uuid;
begin
  for u in
    select au.id as user_id, fs.spending_currency
    from auth.users au
    join public.financial_settings fs on fs.user_id = au.id
    where not exists (select 1 from public.goals g where g.user_id = au.id)
  loop
    insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded, due_date)
    values (u.user_id, 'Annual Rent', 'Always have next year''s rent ready.', 'rent', 'critical', 12, 1800000, u.spending_currency, 'active', 'fixed', true, '2027-08-01')
    returning id into v_rent_goal_id;

    insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
    values (u.user_id, 'Emergency Fund', '6 months of living expenses, ready for emergencies.', 'emergency', 'critical', 12, 3000000, u.spending_currency, 'active', 'fixed', true)
    returning id into v_emergency_goal_id;

    insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
    values (u.user_id, 'Wedding Fund', 'Save for your future wedding.', 'wedding', 'high', 8, 6000000, u.spending_currency, 'active', 'fixed', true)
    returning id into v_wedding_goal_id;

    insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
    values (u.user_id, 'Investment Portfolio', 'Ongoing long-term wealth building (ETFs, index funds, etc.).', 'investment', 'high', 20, 0, u.spending_currency, 'active', 'ongoing', true)
    returning id into v_investment_goal_id;

    insert into public.goals (user_id, name, description, category, priority, contribution_percentage, target_amount, currency, status, target_type, is_auto_funded)
    values (u.user_id, 'Business Growth Fund', 'Courses, AI tools, laptop, startup, agency, equipment.', 'business', 'medium', 7, 0, u.spending_currency, 'active', 'ongoing', true)
    returning id into v_business_goal_id;

    update public.budget_categories set linked_goal_id = v_rent_goal_id where user_id = u.user_id and name = '🏠 Rent Fund' and linked_goal_id is null;
    update public.budget_categories set linked_goal_id = v_emergency_goal_id where user_id = u.user_id and name = '🚨 Emergency Fund' and linked_goal_id is null;
    update public.budget_categories set linked_goal_id = v_investment_goal_id where user_id = u.user_id and name = '📈 Investments' and linked_goal_id is null;
    update public.budget_categories set linked_goal_id = v_wedding_goal_id where user_id = u.user_id and name = '💍 Wedding Fund' and linked_goal_id is null;
    update public.budget_categories set linked_goal_id = v_business_goal_id where user_id = u.user_id and name = '🚀 Business & Self Development' and linked_goal_id is null;
  end loop;
end $$;
