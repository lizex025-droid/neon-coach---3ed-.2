-- Existing data is retained. All client authorization is based on verified JWTs.
alter function public.handle_new_user() set search_path = '';
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Replace overlapping policies and close self-assignment of coach privileges.
do $$
declare p record; t record; owner_column text;
begin
  for p in select tablename, policyname from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
    execute format('revoke all on public.%I from anon', t.tablename);
    execute format('revoke all on public.%I from authenticated', t.tablename);
    if t.tablename = 'coach_clients' then
      execute 'grant select on public.coach_clients to authenticated';
      execute 'create policy assigned_relationship_read on public.coach_clients for select to authenticated using (not coalesce((select auth.jwt()->>''is_anonymous'')::boolean, false) and ((select auth.uid()) = client_id or ((select auth.uid()) = coach_id and (select auth.jwt()->''app_metadata''->>''role'') = ''coach'')))';
    else
      owner_column := case when t.tablename = 'profiles' then 'id' else 'user_id' end;
      execute format('grant select, insert, update, delete on public.%I to authenticated', t.tablename);
      execute format('create policy owner_access on public.%I for all to authenticated using ((select auth.uid()) = %I and not coalesce((select auth.jwt()->>''is_anonymous'')::boolean, false)) with check ((select auth.uid()) = %I and not coalesce((select auth.jwt()->>''is_anonymous'')::boolean, false))', t.tablename, owner_column, owner_column);
    end if;
  end loop;
end $$;

-- Profiles are created by the Auth trigger; clients cannot change role or identity.
revoke insert, update, delete on public.profiles from authenticated;
grant update (name, phone, age, gender, height, current_weight, target_weight,
  target_calories, target_protein, target_carbs, target_fats, target_water_liters,
  target_glasses, onboarding_completed, activity_level, fitness_goal,
  training_days_per_week, equipment, injuries, allergies, liked_foods, disliked_foods,
  updated_at) on public.profiles to authenticated;

-- A message cannot refer to a conversation owned by another account.
drop policy owner_access on public.ai_messages;
create policy owner_access on public.ai_messages for all to authenticated
using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false))
with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false)
  and exists (select 1 from public.ai_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create table public.user_state (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 10000000),
  revision bigint not null default 1 check (revision > 0),
  updated_at timestamptz not null default now()
);
alter table public.user_state enable row level security;
revoke all on public.user_state from anon;
grant select, insert, update on public.user_state to authenticated;
create policy owner_access on public.user_state for all to authenticated
using ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false))
with check ((select auth.uid()) = user_id and not coalesce((select auth.jwt()->>'is_anonymous')::boolean, false));

-- Optimistic concurrency: stale devices cannot silently overwrite a newer revision.
-- SECURITY INVOKER keeps RLS and column permissions active throughout the transaction.
create function public.save_user_state(payload jsonb, expected_revision bigint)
returns bigint language plpgsql security invoker set search_path = '' as $$
declare new_revision bigint; profile jsonb;
begin
  if auth.uid() is null or coalesce((auth.jwt()->>'is_anonymous')::boolean, false) then
    raise exception 'Authentication required' using errcode = '42501';
  end if;
  if jsonb_typeof(payload->'userProfile') is distinct from 'object'
    or jsonb_typeof(payload->'today') is distinct from 'object'
    or jsonb_typeof(payload->'loggedMeals') is distinct from 'array'
    or payload ?| array['auth','currentRole','coachClients'] then
    raise exception 'Invalid account snapshot' using errcode = '22023';
  end if;
  insert into public.user_state as s (user_id, payload, revision)
  select auth.uid(), payload, 1 where expected_revision = 0
  on conflict (user_id) do nothing returning revision into new_revision;
  if new_revision is null then
    update public.user_state s set payload = save_user_state.payload,
      revision = s.revision + 1, updated_at = now()
    where s.user_id = auth.uid() and s.revision = expected_revision
    returning s.revision into new_revision;
  end if;
  if new_revision is null then raise exception 'Account changed on another device' using errcode = '40001'; end if;
  profile := payload->'userProfile';
  update public.profiles set
    name = left(coalesce(profile->>'name', name), 100),
    onboarding_completed = coalesce((profile->>'onboardingCompleted')::boolean, false),
    current_weight = nullif(profile->>'currentWeight', '')::numeric,
    target_weight = nullif(profile->>'targetWeight', '')::numeric,
    height = nullif(profile->>'height', '')::numeric,
    age = nullif(profile->>'age', '')::integer,
    target_calories = (payload->'today'->>'targetCalories')::integer,
    target_protein = (payload->'today'->>'targetProtein')::integer,
    target_carbs = (payload->'today'->>'targetCarbs')::integer,
    target_fats = (payload->'today'->>'targetFats')::integer,
    target_water_liters = (payload->'today'->>'targetWaterLiters')::numeric,
    target_glasses = (payload->'today'->>'targetGlasses')::integer,
    updated_at = now()
  where id = auth.uid();
  return new_revision;
end $$;
revoke all on function public.save_user_state(jsonb, bigint) from public, anon;
grant execute on function public.save_user_state(jsonb, bigint) to authenticated;

create index if not exists coach_clients_client_idx on public.coach_clients(client_id);
create index if not exists ai_messages_conversation_idx on public.ai_messages(conversation_id);
notify pgrst, 'reload schema';
