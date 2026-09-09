-- ==============================================================================
-- NEON COACH - COMPLETE DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  name TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('client', 'coach', 'admin')),
  avatar_url TEXT,
  age INTEGER,
  gender TEXT,
  height NUMERIC(5,2),
  current_weight NUMERIC(5,2),
  target_weight NUMERIC(5,2),
  fitness_goal TEXT,
  activity_level TEXT,
  training_days_per_week INTEGER DEFAULT 4,
  equipment TEXT[] DEFAULT '{}',
  injuries TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  liked_foods TEXT[] DEFAULT '{}',
  disliked_foods TEXT[] DEFAULT '{}',
  target_calories INTEGER DEFAULT 2000,
  target_protein INTEGER DEFAULT 150,
  target_carbs INTEGER DEFAULT 200,
  target_fats INTEGER DEFAULT 60,
  target_water_liters NUMERIC(3,1) DEFAULT 3.0,
  target_glasses INTEGER DEFAULT 12,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coach_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'active' CHECK (status IN ('pending', 'active', 'paused', 'cancelled')),
  started_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

CREATE TABLE IF NOT EXISTS public.meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  meal_name TEXT NOT NULL,
  calories NUMERIC(7,2) DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fats NUMERIC(6,2) DEFAULT 0,
  items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.custom_foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'عام',
  calories NUMERIC(7,2) NOT NULL,
  protein NUMERIC(6,2) NOT NULL,
  carbs NUMERIC(6,2) NOT NULL,
  fats NUMERIC(6,2) NOT NULL,
  serving_size NUMERIC(6,2) DEFAULT 100,
  serving_unit TEXT DEFAULT 'g',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  glasses_count INTEGER DEFAULT 0,
  milliliters INTEGER DEFAULT 0,
  target_milliliters INTEGER DEFAULT 3000,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.daily_supplement_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  supplement_id TEXT NOT NULL,
  supplement_name TEXT NOT NULL,
  dosage TEXT,
  timing_window TEXT,
  taken_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  workout_id TEXT NOT NULL,
  workout_title TEXT NOT NULL,
  day_number INTEGER,
  duration_minutes INTEGER DEFAULT 0,
  total_volume_kg NUMERIC(10,2) DEFAULT 0,
  rpe_rating NUMERIC(3,1),
  notes TEXT,
  sets_completed JSONB DEFAULT '[]'::jsonb,
  completed_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.exercise_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  best_weight_kg NUMERIC(6,2) DEFAULT 0,
  best_reps INTEGER DEFAULT 0,
  estimated_1rm NUMERIC(6,2) DEFAULT 0,
  achieved_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.inbody_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight_kg NUMERIC(5,2) NOT NULL,
  muscle_mass_kg NUMERIC(5,2),
  body_fat_percentage NUMERIC(4,2),
  visceral_fat_level INTEGER,
  water_percentage NUMERIC(4,2),
  inbody_pdf_url TEXT,
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'محادثة جديدة',
  mode TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  audio_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.ai_user_memories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  memory_key TEXT NOT NULL,
  memory_value TEXT NOT NULL,
  context_tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, memory_key)
);

CREATE TABLE IF NOT EXISTS public.daily_energy_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  energy_score INTEGER CHECK (energy_score BETWEEN 1 AND 5),
  sleep_hours NUMERIC(3,1),
  sleep_quality INTEGER CHECK (sleep_quality BETWEEN 1 AND 5),
  mood_rating TEXT,
  soreness_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, log_date)
);

CREATE TABLE IF NOT EXISTS public.shopping_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity TEXT,
  category TEXT DEFAULT 'أطعمة',
  is_purchased BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.weekly_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_number INTEGER,
  weight_avg NUMERIC(5,2),
  nutrition_adherence_percent INTEGER,
  workout_adherence_percent INTEGER,
  water_adherence_percent INTEGER,
  sleep_avg_hours NUMERIC(3,1),
  client_feedback TEXT,
  coach_notes TEXT,
  coach_voice_note_url TEXT,
  reviewed_by_coach_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_supplement_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inbody_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_user_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_energy_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
