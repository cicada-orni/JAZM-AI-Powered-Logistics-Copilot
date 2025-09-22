alter table "webhook_deliveries"
    add column "event_id" text,
    add column "api_version" text not null default '2025-07',
    add column "last_received_at" timestamptz not null default now(),
    add column "duplicate_count" integer not null default 0,
    add column "latency_ms" integer,
    add column "headers" jsonb;

-- updating existing event_id with webhook_id
update "webhook_deliveries" set "event_id" = "webhook_id" where "event_id" is null;

-- set event_id to non-nullable
alter table "webhook_deliveries" alter column "event_id" set not null;

alter table "webhook_deliveries"
    add constraint "webhook_deliveries_event_id_key" unique ("event_id");
create index "webhook_deliveries_received_at_idx"
    on "webhook_deliveries" ("received_at");
create index "webhook_deliveries_topic_shop_domain_idx"
    on "webhook_deliveries" ("topic", "shop_domain");