-- Apply to Supabase LOCAL only. Existing application tables remain the source of truth.
BEGIN;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname='neon_agent') THEN CREATE ROLE neon_agent NOLOGIN; END IF;
END $$;
GRANT authenticated TO neon_agent;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'Asia/Amman';
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL, quantity text, is_completed boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.neon_threads (
  id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  messages jsonb NOT NULL DEFAULT '[]', summary text NOT NULL DEFAULT '', pending jsonb,
  created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(), UNIQUE(id,user_id)
);
CREATE TABLE IF NOT EXISTS public.neon_requests (
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE, request_id uuid NOT NULL, thread_id uuid NOT NULL,
  input_hash text NOT NULL, response jsonb, execution jsonb, effects jsonb NOT NULL DEFAULT '[]', undone boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY(user_id,request_id),
  FOREIGN KEY(thread_id,user_id) REFERENCES public.neon_threads(id,user_id) ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS public.neon_rate_events (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS neon_threads_owner ON public.neon_threads(user_id);
CREATE INDEX IF NOT EXISTS neon_requests_thread ON public.neon_requests(thread_id,user_id);
CREATE INDEX IF NOT EXISTS neon_requests_owner_time ON public.neon_requests(user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS neon_rate_owner_time ON public.neon_rate_events(user_id,created_at);
CREATE INDEX IF NOT EXISTS neon_weight_owner_date ON public.inbody_records(user_id,date);
CREATE INDEX IF NOT EXISTS neon_shopping_owner ON public.shopping_items(user_id);
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['neon_threads','neon_requests','neon_rate_events','shopping_items'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='neon_owner') THEN
      EXECUTE format('CREATE POLICY neon_owner ON public.%I FOR ALL TO authenticated USING ((select auth.uid())=user_id) WITH CHECK ((select auth.uid())=user_id)',t);
    END IF;
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated',t);
    EXECUTE format('REVOKE ALL ON public.%I FROM anon',t);
  END LOOP;
END $$;
GRANT USAGE, SELECT ON SEQUENCE public.neon_rate_events_id_seq TO authenticated;
-- Journal writes are backend-only. Owning a browser session must not allow forging an execution receipt.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.neon_threads,public.neon_requests,public.neon_rate_events TO neon_agent;
GRANT USAGE, SELECT ON SEQUENCE public.neon_rate_events_id_seq TO neon_agent;
REVOKE INSERT, UPDATE, DELETE ON public.neon_threads,public.neon_requests,public.neon_rate_events FROM authenticated;
REVOKE USAGE, SELECT ON SEQUENCE public.neon_rate_events_id_seq FROM authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meal_logs,public.water_logs,public.workout_logs,public.inbody_records TO authenticated;
GRANT SELECT ON public.profiles TO authenticated;
-- Additional restrictive policies prevent future permissive policies from widening owner access.
DO $$ DECLARE t text; BEGIN
  FOREACH t IN ARRAY ARRAY['meal_logs','water_logs','workout_logs','inbody_records','shopping_items','neon_threads','neon_requests','neon_rate_events'] LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY',t);
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename=t AND policyname='neon_owner_boundary') THEN
      EXECUTE format('CREATE POLICY neon_owner_boundary ON public.%I AS RESTRICTIVE FOR ALL TO authenticated USING ((select auth.uid())=user_id) WITH CHECK ((select auth.uid())=user_id)',t);
    END IF;
  END LOOP;
END $$;
CREATE SCHEMA IF NOT EXISTS neon_checkpoints;
REVOKE ALL ON SCHEMA neon_checkpoints FROM PUBLIC,anon,authenticated;
COMMIT;
