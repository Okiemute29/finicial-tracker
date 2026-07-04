-- Fix "Database error saving new user": the trigger function needs an explicit
-- search_path (and schema-qualified table name) to reliably resolve `financial_settings`
-- when invoked from the `auth` schema context. CREATE OR REPLACE keeps the same
-- function OID, so the existing `on_auth_user_created_settings` trigger picks this up
-- automatically without needing to be recreated.

create or replace function handle_new_user_settings()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.financial_settings (user_id) values (new.id);
  return new;
end;
$$;
