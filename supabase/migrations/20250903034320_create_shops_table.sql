create table if not exists public.shops (
shop_domain text primary key,
offline_access_token text not null,
installed_at timestamptz not null default now(),
uninstalled boolean not null default false
);
-- Optional: index if you’ll query by installed/uninstalled
create index if not exists shops_uninstalled_idx on public.shops (uninstalled);
