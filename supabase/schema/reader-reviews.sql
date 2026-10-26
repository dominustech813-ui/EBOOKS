-- Reviews are accessible only through the authenticated reader-experience function.
create table public.hebooks_reviews (
  product_id text not null references public.hebooks_products(id),
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 1000),
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, user_id)
);
alter table public.hebooks_reviews enable row level security;
revoke all on public.hebooks_reviews from anon, authenticated;
grant select, insert, update, delete on public.hebooks_reviews to service_role;
create policy reviews_service_only on public.hebooks_reviews for all to service_role using (true) with check (true);
create index hebooks_reviews_product_date on public.hebooks_reviews(product_id, created_at desc);
create index hebooks_reviews_user on public.hebooks_reviews(user_id);
