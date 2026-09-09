begin;
select set_config('neon.test_a', gen_random_uuid()::text, true), set_config('neon.test_b', gen_random_uuid()::text, true);
insert into auth.users (id,email,raw_user_meta_data) values
(current_setting('neon.test_a')::uuid, current_setting('neon.test_a')||'@example.invalid', '{"name":"RLS A"}'),
(current_setting('neon.test_b')::uuid, current_setting('neon.test_b')||'@example.invalid', '{"name":"RLS B"}');
select set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('neon.test_a'),'role','authenticated','is_anonymous',false)::text, true);
set local role authenticated;
do $$
declare revision bigint; blocked boolean; other_id uuid := current_setting('neon.test_b')::uuid;
begin
  if (select count(*) from public.profiles) <> 1 then raise exception 'Cross-account profile leak'; end if;
  revision := public.save_user_state('{"userProfile":{"name":"RLS A"},"today":{},"loggedMeals":[]}'::jsonb,0);
  if revision <> 1 then raise exception 'Initial save failed'; end if;
  blocked := false;
  begin perform public.save_user_state('{"userProfile":{},"today":{},"loggedMeals":[]}'::jsonb,0);
  exception when serialization_failure then blocked := true; end;
  if not blocked then raise exception 'Stale revision was accepted'; end if;
  blocked := false;
  begin insert into public.user_state(user_id,payload) values(other_id,'{}');
  exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Cross-account write accepted'; end if;
  blocked := false;
  begin update public.profiles set role='coach' where id=auth.uid();
  exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Self-promotion accepted'; end if;
  blocked := false;
  begin insert into public.coach_clients(coach_id,client_id) values(auth.uid(),other_id);
  exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Self-assignment accepted'; end if;
  blocked := false;
  begin insert into storage.objects(bucket_id,name) values('progress-photos',other_id::text||'/foreign.jpg');
  exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Cross-account storage write accepted'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('neon.test_b'),'role','authenticated','is_anonymous',false)::text, true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.user_state) then raise exception 'Cross-account snapshot read accepted'; end if;
  update public.user_state set payload='{}' where user_id=current_setting('neon.test_a')::uuid;
  if found then raise exception 'Cross-account update accepted'; end if;
end $$;
reset role;
select set_config('request.jwt.claims', jsonb_build_object('sub',current_setting('neon.test_a'),'role','authenticated','is_anonymous',true)::text, true);
set local role authenticated;
do $$ begin
  if exists(select 1 from public.profiles) or exists(select 1 from public.user_state) then raise exception 'Anonymous user access accepted'; end if;
end $$;
reset role;
set local role anon;
do $$
declare blocked boolean := false;
begin
  begin perform public.save_user_state('{}',0); exception when insufficient_privilege then blocked := true; end;
  if not blocked then raise exception 'Anon RPC execution accepted'; end if;
end $$;
reset role;
select 'PASS: ownership, writes, role promotion, coach assignment, storage, anonymous access, revision conflicts' as result;
rollback;
