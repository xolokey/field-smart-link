/*
  # Add GPS Coordinates to Farms

  1. Changes
    - Add latitude and longitude columns to farms table
    - These will store GPS coordinates for location-based AI analysis
    - Enable weather alerts and location-based agricultural insights

  2. Security
    - Uses existing RLS policies on farms table
*/

-- Add GPS coordinates to farms table
ALTER TABLE public.farms
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 8),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(11, 8);
