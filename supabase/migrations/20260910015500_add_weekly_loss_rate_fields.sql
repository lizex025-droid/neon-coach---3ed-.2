-- NEON COACH: Migration to add weekly loss rate and calorie deficit fields
-- Added for Step 2 Weekly Loss Rate Selection Feature

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS weekly_loss_percent NUMERIC(6, 4) DEFAULT 0.0075,
  ADD COLUMN IF NOT EXISTS weekly_loss_kg NUMERIC(5, 2) DEFAULT 0.50,
  ADD COLUMN IF NOT EXISTS daily_calorie_deficit INT DEFAULT 500,
  ADD COLUMN IF NOT EXISTS requested_calories INT,
  ADD COLUMN IF NOT EXISTS estimated_goal_weeks NUMERIC(6, 1),
  ADD COLUMN IF NOT EXISTS weight_loss_risk_level TEXT DEFAULT 'optimal';

COMMENT ON COLUMN public.profiles.weekly_loss_percent IS 'Weekly body weight loss rate percentage, e.g. 0.0075 for 0.75%';
COMMENT ON COLUMN public.profiles.weekly_loss_kg IS 'Estimated weekly weight loss in kilograms';
COMMENT ON COLUMN public.profiles.daily_calorie_deficit IS 'Calculated daily calorie deficit';
COMMENT ON COLUMN public.profiles.requested_calories IS 'Calculated daily calorie target based on chosen deficit';
COMMENT ON COLUMN public.profiles.estimated_goal_weeks IS 'Estimated number of weeks to reach target weight';
COMMENT ON COLUMN public.profiles.weight_loss_risk_level IS 'Safety level evaluation: mild, normal, optimal, fast, aggressive, extreme, high_risk';
