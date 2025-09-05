-- SHOPS TABLE
create table if not exists shops(
    shop_domain text primary key,
    offline_access_token text not null,
    installed_at timestamptz not null default now(),
    uninstalled boolean not null default false
);