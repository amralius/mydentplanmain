create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  topic text not null,
  message text not null,
  source text default 'faq',
  status text not null default 'new'
);

alter table public.support_tickets enable row level security;

drop policy if exists "Anyone can create support tickets" on public.support_tickets;
create policy "Anyone can create support tickets"
on public.support_tickets
for insert
to anon, authenticated
with check (true);

-- Optional: read tickets only from the Supabase dashboard/service role.
-- To email yourself on new tickets, add a Supabase Database Webhook on inserts
-- from public.support_tickets to an email service such as Resend, SendGrid, or Zapier.
