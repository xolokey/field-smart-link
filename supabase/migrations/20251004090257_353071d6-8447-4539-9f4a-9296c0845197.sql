-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create farms table
CREATE TABLE public.farms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT,
  size_hectares DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create crops table
CREATE TABLE public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  planting_date DATE,
  expected_harvest_date DATE,
  area_hectares DECIMAL(10, 2),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'harvested', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create crop_monitoring table
CREATE TABLE public.crop_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  monitoring_date DATE NOT NULL DEFAULT CURRENT_DATE,
  health_score INTEGER CHECK (health_score >= 0 AND health_score <= 100),
  soil_moisture DECIMAL(5, 2),
  temperature DECIMAL(5, 2),
  notes TEXT,
  alert_level TEXT DEFAULT 'normal' CHECK (alert_level IN ('normal', 'warning', 'critical')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ai_chat_sessions table
CREATE TABLE public.ai_chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create ai_chat_messages table
CREATE TABLE public.ai_chat_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.ai_chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Farms RLS policies
CREATE POLICY "Users can view their own farms"
  ON public.farms FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own farms"
  ON public.farms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own farms"
  ON public.farms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own farms"
  ON public.farms FOR DELETE
  USING (auth.uid() = user_id);

-- Crops RLS policies
CREATE POLICY "Users can view crops from their farms"
  ON public.crops FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create crops on their farms"
  ON public.crops FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can update crops on their farms"
  ON public.crops FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete crops from their farms"
  ON public.crops FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.farms
    WHERE farms.id = crops.farm_id AND farms.user_id = auth.uid()
  ));

-- Crop monitoring RLS policies
CREATE POLICY "Users can view monitoring data for their crops"
  ON public.crop_monitoring FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.crops
    JOIN public.farms ON farms.id = crops.farm_id
    WHERE crops.id = crop_monitoring.crop_id AND farms.user_id = auth.uid()
  ));

CREATE POLICY "Users can create monitoring data for their crops"
  ON public.crop_monitoring FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.crops
    JOIN public.farms ON farms.id = crops.farm_id
    WHERE crops.id = crop_monitoring.crop_id AND farms.user_id = auth.uid()
  ));

-- AI chat RLS policies
CREATE POLICY "Users can view their own chat sessions"
  ON public.ai_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own chat sessions"
  ON public.ai_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat sessions"
  ON public.ai_chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chat sessions"
  ON public.ai_chat_sessions FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages from their sessions"
  ON public.ai_chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE ai_chat_sessions.id = ai_chat_messages.session_id AND ai_chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "Users can create messages in their sessions"
  ON public.ai_chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.ai_chat_sessions
    WHERE ai_chat_sessions.id = ai_chat_messages.session_id AND ai_chat_sessions.user_id = auth.uid()
  ));

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add updated_at triggers
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.ai_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();