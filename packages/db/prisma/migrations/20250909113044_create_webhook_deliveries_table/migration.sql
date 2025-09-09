create table if not exists webhook_deliveries(
    webhook_id text primary key,
    topic text not null,
    shop_domain text not null,
    triggered_at timestamptz,
    received_at timestamptz not null default now(),
    payload jsonb not null
);

alter table shops
add column if not exists redacted_at timestamptz;