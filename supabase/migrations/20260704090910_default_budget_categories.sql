-- Add a "purpose" description to budget categories, and seed every user
-- (new and existing) with the default "Robert Inc." allocation.

alter table budget_categories add column description text not null default '';

create or replace function handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.financial_settings (user_id) values (new.id);

  insert into public.budget_categories (user_id, name, description, percentage, color, sort_order)
  values
    (new.id, '🏠 Rent Fund', 'Save for next year''s rent.', 12, '#2563eb', 1),
    (new.id, '🚨 Emergency Fund', 'Build until you have 6 months of expenses, then redirect this percentage to investing.', 12, '#dc2626', 2),
    (new.id, '📈 Investments', 'Long-term wealth (ETFs, index funds, etc.).', 20, '#16a34a', 3),
    (new.id, '💍 Wedding Fund', 'Save for your future wedding.', 8, '#db2777', 4),
    (new.id, '🍜 Living Expenses', 'Food, transport, utilities, family support, internet, etc.', 38, '#ea580c', 5),
    (new.id, '🚀 Business & Self Development', 'Courses, AI tools, your startup, agency, equipment.', 7, '#7c3aed', 6),
    (new.id, '🎉 Lifestyle', 'Entertainment, clothes, eating out, guilt-free spending.', 3, '#0f766e', 7);

  return new;
end;
$$;

-- Backfill: give any existing user with zero budget categories the same defaults.
insert into public.budget_categories (user_id, name, description, percentage, color, sort_order)
select u.id, c.name, c.description, c.percentage, c.color, c.sort_order
from auth.users u
cross join (
  values
    ('🏠 Rent Fund', 'Save for next year''s rent.', 12, '#2563eb', 1),
    ('🚨 Emergency Fund', 'Build until you have 6 months of expenses, then redirect this percentage to investing.', 12, '#dc2626', 2),
    ('📈 Investments', 'Long-term wealth (ETFs, index funds, etc.).', 20, '#16a34a', 3),
    ('💍 Wedding Fund', 'Save for your future wedding.', 8, '#db2777', 4),
    ('🍜 Living Expenses', 'Food, transport, utilities, family support, internet, etc.', 38, '#ea580c', 5),
    ('🚀 Business & Self Development', 'Courses, AI tools, your startup, agency, equipment.', 7, '#7c3aed', 6),
    ('🎉 Lifestyle', 'Entertainment, clothes, eating out, guilt-free spending.', 3, '#0f766e', 7)
) as c(name, description, percentage, color, sort_order)
where not exists (
  select 1 from public.budget_categories bc where bc.user_id = u.id
);
