alter table users enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users can view self'
      and tablename = 'users'
      and schemaname = 'public'
  ) then
    create policy "Users can view self"
      on users
      for select
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where policyname = 'Users can update self'
      and tablename = 'users'
      and schemaname = 'public'
  ) then
    create policy "Users can update self"
      on users
      for update
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;
end$$;

alter table sessions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users manage own sessions'
      and tablename = 'sessions'
      and schemaname = 'public'
  ) then
    create policy "Users manage own sessions"
      on sessions
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

alter table messages enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users manage messages in own sessions'
      and tablename = 'messages'
      and schemaname = 'public'
  ) then
    create policy "Users manage messages in own sessions"
      on messages
      for all
      using (
        exists (
          select 1 from sessions s
          where s.id = messages.session_id
            and s.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from sessions s
          where s.id = messages.session_id
            and s.user_id = auth.uid()
        )
      );
  end if;
end$$;

alter table subscriptions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users manage own subscription'
      and tablename = 'subscriptions'
      and schemaname = 'public'
  ) then
    create policy "Users manage own subscription"
      on subscriptions
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

alter table user_points enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users manage own points'
      and tablename = 'user_points'
      and schemaname = 'public'
  ) then
    create policy "Users manage own points"
      on user_points
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end$$;

alter table diagnoses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Users manage own diagnoses'
      and tablename = 'diagnoses'
      and schemaname = 'public'
  ) then
    create policy "Users manage own diagnoses"
      on diagnoses
      for all
      using (
        user_id is null or auth.uid() = user_id
      )
      with check (
        user_id is null or auth.uid() = user_id
      );
  end if;
end$$;
