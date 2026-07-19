-- =========================================================
-- Row Level Security — every table scoped strictly to auth.uid()
-- =========================================================

alter table public.profiles enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.budgets enable row level security;
alter table public.goals enable row level security;
alter table public.emergency_fund enable row level security;
alter table public.business_fund enable row level security;
alter table public.investments enable row level security;
alter table public.loans enable row level security;
alter table public.emis enable row level security;
alter table public.net_worth_snapshots enable row level security;
alter table public.zakat_calculations enable row level security;
alter table public.sadaqah_entries enable row level security;
alter table public.notifications enable row level security;
alter table public.user_settings enable row level security;

-- profiles: user can only see/edit their own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Generic pattern applied to every user-owned table below:
-- select/insert/update/delete all gated on user_id = auth.uid()

create policy "accounts_all_own" on public.accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "categories_all_own" on public.categories for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "transactions_all_own" on public.transactions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "budgets_all_own" on public.budgets for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "goals_all_own" on public.goals for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "emergency_fund_all_own" on public.emergency_fund for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "business_fund_all_own" on public.business_fund for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "investments_all_own" on public.investments for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "loans_all_own" on public.loans for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "emis_all_own" on public.emis for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "net_worth_all_own" on public.net_worth_snapshots for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "zakat_all_own" on public.zakat_calculations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "sadaqah_all_own" on public.sadaqah_entries for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "notifications_all_own" on public.notifications for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_settings_all_own" on public.user_settings for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Auto-create profile + settings rows on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name) values (new.id, new.raw_user_meta_data->>'full_name');
  insert into public.user_settings (user_id) values (new.id);
  insert into public.emergency_fund (user_id) values (new.id);
  insert into public.business_fund (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
