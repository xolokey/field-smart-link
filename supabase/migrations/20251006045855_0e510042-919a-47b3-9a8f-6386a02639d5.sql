-- Add latitude and longitude columns to farms table
ALTER TABLE public.farms 
ADD COLUMN IF NOT EXISTS latitude NUMERIC,
ADD COLUMN IF NOT EXISTS longitude NUMERIC;