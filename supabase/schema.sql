-- NEON COACH - Supabase Database Schema & RLS Policies
-- Project: fqwjcacuxsumqpmdsfxc

-- 1. Profiles Table (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'trainee' CHECK (role IN ('trainee', 'coach', 'admin')),
  age INT,
  gender TEXT,
  height NUMERIC(5, 2),
  current_weight NUMERIC(5, 2),
  target_weight NUMERIC(5, 2),
  target_calories INT DEFAULT 2400,
  target_protein INT DEFAULT 180,
  target_carbs INT DEFAULT 250,
  target_fats INT DEFAULT 65,
  target_water_liters NUMERIC(3, 1) DEFAULT 2.5,
  target_glasses INT DEFAULT 10,
  is_demo_mode BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 2. Daily Meals Log
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

CREATE POLICY "Users can manage their own meal logs"
  ON public.meal_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_meal_logs_user_date ON public.meal_logs(user_id, date);

-- 3. Daily Water & Hydration Log
CREATE TABLE IF NOT EXISTS public.water_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  consumed_ml INT DEFAULT 0 NOT NULL,
  consumed_glasses INT DEFAULT 0 NOT NULL,
  target_glasses INT DEFAULT 10 NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
  CONSTRAINT unique_user_water_date UNIQUE (user_id, date)
);

ALTER TABLE public.water_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own water logs"
  ON public.water_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Workout Sessions & History Log
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  workout_title TEXT NOT NULL,
  program_type TEXT DEFAULT 'forty_days',
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  duration_minutes INT DEFAULT 45,
  total_volume_kg NUMERIC(8, 2) DEFAULT 0,
  completed BOOLEAN DEFAULT TRUE,
  exercises JSONB DEFAULT '[]'::JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own workout logs"
  ON public.workout_logs FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_workout_logs_user_date ON public.workout_logs(user_id, date);

-- 5. InBody & Measurements Records
CREATE TABLE IF NOT EXISTS public.inbody_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date DATE DEFAULT CURRENT_DATE NOT NULL,
  weight NUMERIC(5, 2) NOT NULL,
  body_fat_pct NUMERIC(4, 1),
  muscle_mass_kg NUMERIC(5, 2),
  water_pct NUMERIC(4, 1),
  visceral_fat INT,
  inbody_pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

ALTER TABLE public.inbody_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own inbody records"
  ON public.inbody_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Trigger to create a profile automatically on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
