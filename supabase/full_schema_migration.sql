-- ====================================================================
-- NEON COACH - Complete Production Database Architecture
-- Project: fqwjcacuxsumqpmdsfxc
-- Covers: 100% of app features with strict Row Level Security (RLS)
-- ====================================================================

-- 1. Profiles (الملف الشخصي، الأهداف، القياسات، التفضيلات)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'trainee' CHECK (role IN ('trainee', 'coach', 'admin')),
  age INT,
  gender TEXT,
  height NUMERIC(5, 2),
  current_weight NUMERIC(5, 2),
  target_weight NUMERIC(5, 2),
  body_fat_pct NUMERIC(4, 1),
  activity_level TEXT,
  fitness_goal TEXT DEFAULT 'recomp',
  target_calories INT DEFAULT 2400,
  target_protein INT DEFAULT 180,
  target_carbs INT DEFAULT 250,
  target_fats INT DEFAULT 65,
  target_water_liters NUMERIC(3, 1) DEFAULT 2.5,
  target_glasses INT DEFAULT 10,
  injuries TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  training_days_per_week INT DEFAULT 4,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  is_demo_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_owner_select') THEN
    CREATE POLICY "profiles_owner_select" ON public.profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_owner_update') THEN
    CREATE POLICY "profiles_owner_update" ON public.profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'profiles_owner_insert') THEN
    CREATE POLICY "profiles_owner_insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. علاقة المدرب بالمتدربين (Coach-Client Relationships)
CREATE TABLE IF NOT EXISTS public.coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'pending', 'paused', 'archived')),
  assigned_program_id TEXT DEFAULT 'forty_days',
  assigned_nutrition_target_calories INT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_coach_client UNIQUE (coach_id, client_id)
);

ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coach_clients' AND policyname = 'coach_clients_access') THEN
    CREATE POLICY "coach_clients_access" ON public.coach_clients FOR ALL
      USING (auth.uid() = coach_id OR auth.uid() = client_id)
      WITH CHECK (auth.uid() = coach_id OR auth.uid() = client_id);
  END IF;
END $$;

-- السماح للمدرب بقراءة بروفايل متدربيه
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'coach_view_clients_profile') THEN
    CREATE POLICY "coach_view_clients_profile" ON public.profiles FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = profiles.id AND status = 'active'
        )
      );
  END IF;
END $$;

-- 3. سجل الوجبات اليومية (Meal Logs)
CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  meal_type TEXT DEFAULT 'meal' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'post_workout', 'meal')),
  name TEXT NOT NULL,
  calories INT NOT NULL DEFAULT 0,
  protein NUMERIC(6, 1) NOT NULL DEFAULT 0,
  carbs NUMERIC(6, 1) NOT NULL DEFAULT 0,
  fats NUMERIC(6, 1) NOT NULL DEFAULT 0,
  items JSONB DEFAULT '[]'::JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_logs' AND policyname = 'meal_logs_owner_all') THEN
    CREATE POLICY "meal_logs_owner_all" ON public.meal_logs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'meal_logs' AND policyname = 'coach_view_clients_meals') THEN
    CREATE POLICY "coach_view_clients_meals" ON public.meal_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = meal_logs.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date);

-- 4. الأطعمة والوصفات المخصصة (Custom Foods & Recipes)
CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_en TEXT,
  category TEXT DEFAULT 'custom',
  serving_size_g NUMERIC(6, 1) DEFAULT 100,
  calories_per_100g INT NOT NULL,
  protein_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0,
  carbs_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0,
  fats_per_100g NUMERIC(6, 1) NOT NULL DEFAULT 0,
  barcode TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'custom_foods' AND policyname = 'custom_foods_owner') THEN
    CREATE POLICY "custom_foods_owner" ON public.custom_foods FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 5. تتبع شرب الماء والترطيب اليومي (Water & Hydration Logs)
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  consumed_ml INT DEFAULT 0 NOT NULL,
  consumed_glasses INT DEFAULT 0 NOT NULL,
  target_glasses INT DEFAULT 10 NOT NULL,
  events JSONB DEFAULT '[]'::JSONB,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_water_date UNIQUE (user_id, date)
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_logs' AND policyname = 'water_logs_owner') THEN
    CREATE POLICY "water_logs_owner" ON public.water_logs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'water_logs' AND policyname = 'coach_view_clients_water') THEN
    CREATE POLICY "coach_view_clients_water" ON public.water_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = water_logs.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

-- 6. تتبع المكملات اليومية (Daily Supplement Stack Logs)
CREATE TABLE IF NOT EXISTS public.daily_supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  supplement_id TEXT NOT NULL,
  supplement_name TEXT NOT NULL,
  dose TEXT,
  timing_window TEXT DEFAULT 'morning' CHECK (timing_window IN ('morning', 'lunch', 'evening', 'anytime', 'pre_workout', 'post_workout')),
  taken BOOLEAN DEFAULT FALSE NOT NULL,
  taken_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_supp_date UNIQUE (user_id, date, supplement_id)
);

ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_supplement_logs' AND policyname = 'supp_logs_owner') THEN
    CREATE POLICY "supp_logs_owner" ON public.daily_supplement_logs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_supplement_logs' AND policyname = 'coach_view_clients_supps') THEN
    CREATE POLICY "coach_view_clients_supps" ON public.daily_supplement_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = daily_supplement_logs.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_supp_logs_user_date ON public.daily_supplement_logs(user_id, date);

-- 7. سجل جلسات التمارين والـ 40 يوم (Workout Sessions & Logs)
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_title TEXT NOT NULL,
  program_type TEXT DEFAULT 'forty_days',
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  duration_minutes INT DEFAULT 45,
  total_volume_kg NUMERIC(8, 2) DEFAULT 0,
  rpe NUMERIC(3, 1),
  completed BOOLEAN DEFAULT TRUE,
  exercises JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'workout_logs_owner') THEN
    CREATE POLICY "workout_logs_owner" ON public.workout_logs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'workout_logs' AND policyname = 'coach_view_clients_workouts') THEN
    CREATE POLICY "coach_view_clients_workouts" ON public.workout_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = workout_logs.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date);

-- 8. الأرقام القياسية والتدرج بالأوزان (Personal Records & Progressive Overload)
CREATE TABLE IF NOT EXISTS public.exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  max_weight_kg NUMERIC(6, 2) NOT NULL,
  max_reps INT NOT NULL,
  estimated_1rm NUMERIC(6, 2),
  achieved_date DATE DEFAULT CURRENT_DATE NOT NULL,
  notes TEXT,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_exercise_record UNIQUE (user_id, exercise_id)
);

ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exercise_records' AND policyname = 'exercise_records_owner') THEN
    CREATE POLICY "exercise_records_owner" ON public.exercise_records FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'exercise_records' AND policyname = 'coach_view_clients_prs') THEN
    CREATE POLICY "coach_view_clients_prs" ON public.exercise_records FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = exercise_records.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

-- 9. قياسات الجسم وفحوصات InBody (Body Measurements & Scans)
CREATE TABLE IF NOT EXISTS public.inbody_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  weight NUMERIC(5, 2) NOT NULL,
  body_fat_pct NUMERIC(4, 1),
  muscle_mass_kg NUMERIC(5, 2),
  water_pct NUMERIC(4, 1),
  visceral_fat INT,
  chest_cm NUMERIC(5, 2),
  waist_cm NUMERIC(5, 2),
  hips_cm NUMERIC(5, 2),
  arms_cm NUMERIC(5, 2),
  thighs_cm NUMERIC(5, 2),
  photo_urls TEXT[] DEFAULT '{}',
  inbody_pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.inbody_records ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inbody_records' AND policyname = 'inbody_records_owner') THEN
    CREATE POLICY "inbody_records_owner" ON public.inbody_records FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inbody_records' AND policyname = 'coach_view_clients_inbody') THEN
    CREATE POLICY "coach_view_clients_inbody" ON public.inbody_records FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = inbody_records.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_inbody_user_date ON public.inbody_records(user_id, date);

-- 10. محادثات وجلسات مدرب الذكاء الاصطناعي NEON AI
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'محادثة جديدة مع NEON AI',
  model TEXT DEFAULT 'gemini-2.0-flash',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_conversations' AND policyname = 'ai_convos_owner') THEN
    CREATE POLICY "ai_convos_owner" ON public.ai_conversations FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 11. رسائل محادثات NEON AI (AI Messages)
CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::JSONB,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_messages' AND policyname = 'ai_messages_owner') THEN
    CREATE POLICY "ai_messages_owner" ON public.ai_messages FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ai_messages_convo ON public.ai_messages(conversation_id, created_at);

-- 12. ذاكرة NEON AI السياقية الدائمة للمتدرب (AI Long-term User Memory)
CREATE TABLE IF NOT EXISTS public.ai_user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'nutrition', 'injury', 'preference', 'goal')),
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_memory_key UNIQUE (user_id, memory_key)
);

ALTER TABLE public.ai_user_memories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'ai_user_memories' AND policyname = 'ai_memories_owner') THEN
    CREATE POLICY "ai_memories_owner" ON public.ai_user_memories FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 13. تقييم الطاقة والحالة اليومية (Daily Energy & Wellbeing)
CREATE TABLE IF NOT EXISTS public.daily_energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  energy_level INT CHECK (energy_level BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3, 1),
  mood TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_energy_date UNIQUE (user_id, date)
);

ALTER TABLE public.daily_energy_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_energy_logs' AND policyname = 'daily_energy_owner') THEN
    CREATE POLICY "daily_energy_owner" ON public.daily_energy_logs FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'daily_energy_logs' AND policyname = 'coach_view_clients_energy') THEN
    CREATE POLICY "coach_view_clients_energy" ON public.daily_energy_logs FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = daily_energy_logs.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

-- 14. قائمة التسوق والمقاضي الذكية (Shopping List)
CREATE TABLE IF NOT EXISTS public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'protein',
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  added_date DATE DEFAULT CURRENT_DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'shopping_items' AND policyname = 'shopping_items_owner') THEN
    CREATE POLICY "shopping_items_owner" ON public.shopping_items FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- 15. مراجعة الالتزام الأسبوعي وتقارير المدرب (Weekly Check-ins & Coaching Reviews)
CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_number INT DEFAULT 1,
  nutrition_adherence_pct NUMERIC(4, 1),
  workout_adherence_pct NUMERIC(4, 1),
  water_adherence_pct NUMERIC(4, 1),
  avg_weight_kg NUMERIC(5, 2),
  trainee_notes TEXT,
  coach_feedback TEXT,
  reviewed_by_coach_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_week UNIQUE (user_id, week_start_date)
);

ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_checkins' AND policyname = 'weekly_checkins_owner') THEN
    CREATE POLICY "weekly_checkins_owner" ON public.weekly_checkins FOR ALL
      USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'weekly_checkins' AND policyname = 'coach_manage_clients_checkins') THEN
    CREATE POLICY "coach_manage_clients_checkins" ON public.weekly_checkins FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = weekly_checkins.user_id AND status = 'active'
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.coach_clients
          WHERE coach_id = auth.uid() AND client_id = weekly_checkins.user_id AND status = 'active'
        )
      );
  END IF;
END $$;

-- 16. Trigger تلقائي لإنشاء بروفايل فور تسجيل أي مستخدم جديد عبر Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(public.profiles.name, EXCLUDED.name),
    updated_at = TIMEZONE('utc'::TEXT, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
