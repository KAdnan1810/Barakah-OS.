-- =========================================================
-- Barakah OS — Initial schema
-- Postgres (Supabase). All monetary values stored as numeric(14,2).
-- All tables use uuid PKs and reference auth.users(id) for ownership.
-- =========================================================

create extension if not exists "uuid-ossp";

-- ---------- Profiles (extends auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  base_currency text not null default 'INR',
  locale text not null default 'en-IN',
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- Accounts ----------
create table if not exists public.accounts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  type text not null check (type in ('bank','cash','business','wallet','investment','other')),
  institution text,
  current_balance numeric(14,2) not null default 0,
  currency text not null default 'INR',
  is_archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Categories ----------
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  parent_category_id uuid references public.categories(id) on delete set null,
  icon text,
  color text,
  kind text not null check (kind in ('expense','income')),
  created_at timestamptz not null default now()
);

-- ---------- Transactions (expenses, income, transfers) ----------
create table if not exists public.transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id uuid not null references public.accounts(id) on delete cascade,
  transfer_to_account_id uuid references public.accounts(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  type text not null check (type in ('expense','income','transfer')),
  income_source text check (income_source in ('salary','business','freelancing','gift','rental','investment','other')),
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'INR',
  date date not null default current_date,
  note text,
  tags text[] default '{}',
  payment_method text check (payment_method in ('cash','debit_card','credit_card','upi','bank_transfer','cheque','other')),
  attachment_url text,
  is_recurring boolean not null default false,
  recurrence_rule text,
  created_at timestamptz not null default now()
);
create index if not exists idx_transactions_user_date on public.transactions(user_id, date desc);
create index if not exists idx_transactions_category on public.transactions(category_id);

-- ---------- Budgets ----------
create table if not exists public.budgets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  month char(7) not null, -- 'YYYY-MM'
  limit_amount numeric(14,2) not null check (limit_amount >= 0),
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  unique (user_id, category_id, month)
);

-- ---------- Goals ----------
create table if not exists public.goals (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  deadline date,
  status text not null default 'in_progress' check (status in ('in_progress','completed','paused','abandoned')),
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

-- ---------- Emergency Fund ----------
create table if not exists public.emergency_fund (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  target_amount numeric(14,2) not null default 0,
  current_amount numeric(14,2) not null default 0,
  monthly_expense_baseline numeric(14,2) not null default 0,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

-- ---------- Business Fund ----------
create table if not exists public.business_fund (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  target_amount numeric(14,2) not null default 0,
  current_amount numeric(14,2) not null default 0,
  monthly_contribution numeric(14,2) not null default 0,
  currency text not null default 'INR',
  updated_at timestamptz not null default now()
);

-- ---------- Investments (halal only, enforced via check constraint) ----------
create table if not exists public.investments (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('gold','shariah_mutual_fund','shariah_stock','sukuk')),
  name text not null,
  purchase_price numeric(14,2) not null,
  current_value numeric(14,2) not null,
  units numeric(14,4),
  purchase_date date not null,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

-- ---------- Loans ----------
create table if not exists public.loans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  principal numeric(14,2) not null,
  outstanding_balance numeric(14,2) not null,
  is_interest_free boolean not null default true,
  start_date date not null,
  tenure_months int not null,
  currency text not null default 'INR',
  created_at timestamptz not null default now()
);

-- ---------- EMIs ----------
create table if not exists public.emis (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  loan_id uuid not null references public.loans(id) on delete cascade,
  amount numeric(14,2) not null,
  due_date date not null,
  is_paid boolean not null default false,
  paid_date date,
  created_at timestamptz not null default now()
);

-- ---------- Net Worth Snapshots ----------
create table if not exists public.net_worth_snapshots (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null default current_date,
  total_assets numeric(14,2) not null,
  total_liabilities numeric(14,2) not null,
  net_worth numeric(14,2) generated always as (total_assets - total_liabilities) stored,
  currency text not null default 'INR',
  created_at timestamptz not null default now(),
  unique (user_id, date)
);

-- ---------- Zakat ----------
create table if not exists public.zakat_calculations (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  hijri_year text not null,
  nisab_threshold numeric(14,2) not null,
  total_zakatable_assets numeric(14,2) not null,
  zakat_due numeric(14,2) not null,
  is_paid boolean not null default false,
  calculated_at timestamptz not null default now()
);

-- ---------- Sadaqah ----------
create table if not exists public.sadaqah_entries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount numeric(14,2) not null,
  recipient text,
  date date not null default current_date,
  note text,
  is_ramadan boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Notifications ----------
create table if not exists public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- Settings ----------
create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'system' check (theme in ('light','dark','system')),
  currency text not null default 'INR',
  notifications_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
