create type webhook_job_status as enum ('pending', 'processing', 'completed', 'failed');
create type webhook_job_topic as enum ('customers_data_request', 'customers_redact', 'shop_redact');

create table if not exists public.webhook_jobs (
    id uuid primary key default gen_random_uuid(),
    topic webhook_job_topic not null,
    shop_domain text not null,
    status webhook_job_status not null default 'pending',
    payload jsonb,
    queued_at timestamptz not null default now(),
    run_at timestamptz not null default now(),
    attempts integer,
    last_error text,
    last_attempt timestamptz,
    due_at timestamptz not null
);

create index if not exists webhook_jobs_status_run_at_idx on public.webhook_jobs (status, run_at);
create index if not exists webhook_jobs_topic_status_idx on public.webhook_jobs (topic, status);
create index if not exists webhook_jobs_due_at_idx on public.webhook_jobs (due_at);