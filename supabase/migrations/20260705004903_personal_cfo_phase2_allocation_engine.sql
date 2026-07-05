-- Personal CFO system, Phase 2: the allocation engine.
-- Runs as a DB trigger (not client code) so goal-balance updates are atomic
-- (`current_amount = current_amount + x`, no read-modify-write) and cannot
-- race with concurrent client writes or double-submits.

create or replace function allocate_income_to_goals()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  bc record;
  v_allocated numeric;
begin
  for bc in
    select id, percentage, linked_goal_id
    from public.budget_categories
    where user_id = new.user_id and linked_goal_id is not null
  loop
    v_allocated := round(new.converted_amount * (bc.percentage / 100.0), 2);

    if v_allocated > 0 then
      update public.goals
      set current_amount = current_amount + v_allocated
      where id = bc.linked_goal_id;

      insert into public.goal_allocations (user_id, transaction_id, goal_id, amount)
      values (new.user_id, new.id, bc.linked_goal_id, v_allocated);
    end if;
  end loop;

  return new;
end;
$$;

-- Fires when a new income transaction is recorded.
create trigger on_income_transaction_insert
  after insert on transactions
  for each row
  when (new.type = 'income')
  execute function allocate_income_to_goals();

-- Fires when an existing expense transaction is edited into an income transaction
-- (closes the gap where that edit would otherwise never trigger an allocation).
create trigger on_transaction_type_change_to_income
  after update on transactions
  for each row
  when (old.type = 'expense' and new.type = 'income')
  execute function allocate_income_to_goals();

-- Known, accepted limitations (not solved this pass):
--   * Editing an income transaction's amount, or deleting it, does not
--     reverse/adjust the goal balances it already funded.
--   * There is no UI yet to inspect or undo a specific allocation; the
--     goal_allocations audit log exists for future use only.
