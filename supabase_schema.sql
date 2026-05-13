-- Create a table for public profiles
create table if not exists profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  phone text,
  social_links jsonb default '{}'::jsonb,
  role text check (role in ('manager', 'team_leader', 'team_member')) default 'team_member',
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create a table for teams
create table if not exists teams (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  owner_id uuid references auth.users not null
);

-- Create a table for team members
create table if not exists team_members (
  team_id uuid references teams on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text check (role in ('manager', 'team_leader', 'team_member')) default 'team_member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (team_id, user_id)
);

-- Create a table for reports
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  team_id uuid references teams not null,
  content jsonb not null, -- { completed: [], planned: [], blockers: [], mood: "", whatsapp: "" }
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  date date default current_date not null
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table reports enable row level security;

-- Profiles: Users can view all profiles in their team, but only edit their own
create policy "Users can view profiles." on profiles
  for select using (true);

create policy "Users can update own profile." on profiles
  for update using (auth.uid() = id);

-- Teams: Only members can view team details
create policy "Members can view teams." on teams
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = teams.id
      and team_members.user_id = auth.uid()
    )
  );

-- Team Members: Members can view fellow members
create policy "Members can view team_members." on team_members
  for select using (
    exists (
      select 1 from team_members tm
      where tm.team_id = team_members.team_id
      and tm.user_id = auth.uid()
    )
  );

-- Reports: Members can view reports in their team
create policy "Members can view reports." on reports
  for select using (
    exists (
      select 1 from team_members
      where team_members.team_id = reports.team_id
      and team_members.user_id = auth.uid()
    )
  );

create policy "Users can insert own reports." on reports
  for insert with check (auth.uid() = user_id);

-- Trigger for new user profile
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, phone, role, social_links)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name', 
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'team_member'),
    '{}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;

-- Re-create trigger safely
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Storage setup for avatars
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Set up storage policies
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using ( bucket_id = 'avatars' );

create policy "Authenticated users can upload avatars."
  on storage.objects for insert
  to authenticated
  with check ( bucket_id = 'avatars' );

create policy "Users can update their own avatars."
  on storage.objects for update
  to authenticated
  using ( bucket_id = 'avatars' );
