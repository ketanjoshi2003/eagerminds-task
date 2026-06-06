-- 1. Create Profiles Table (references auth.users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  handle text unique not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create Bookmarks Table (references auth.users)
create table if not exists public.bookmarks (
  id uuid default gen_random_uuid() not null primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  url text not null,
  is_public boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Enable Row Level Security (RLS) on both tables
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;

-- 4. Set RLS Policies for Profiles
create policy "Allow public read access to profiles" on public.profiles
  for select using (true);

create policy "Allow individual insert access to profiles" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Allow individual update access to profiles" on public.profiles
  for update using (auth.uid() = id);

create policy "Allow individual delete access to profiles" on public.profiles
  for delete using (auth.uid() = id);

-- 5. Set RLS Policies for Bookmarks
create policy "Allow individual control on bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Allow public read access to public bookmarks" on public.bookmarks
  for select using (is_public = true);

-- 6. Trigger to automatically create a Profile when a new auth user is created
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, handle)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'handle',
      split_part(new.email, '@', 1) || '_' || substring(md5(random()::text) from 1 for 4)
    )
  );
  return new;
end;
$$ language plpgsql security definer;

-- Recreate trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
