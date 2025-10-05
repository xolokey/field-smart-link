-- Create storage bucket for crop images
INSERT INTO storage.buckets (id, name, public) VALUES ('crop-images', 'crop-images', true);

-- Create storage policies for crop images
CREATE POLICY "Users can view crop images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'crop-images');

CREATE POLICY "Users can upload crop images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their crop images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their crop images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'crop-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add image URLs to crop_monitoring table
ALTER TABLE crop_monitoring ADD COLUMN IF NOT EXISTS image_urls TEXT[];

-- Create weather_alerts table
CREATE TABLE IF NOT EXISTS public.weather_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  action_required TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS on weather_alerts
ALTER TABLE public.weather_alerts ENABLE ROW LEVEL SECURITY;

-- Create policies for weather_alerts
CREATE POLICY "Users can view alerts for their farms" 
ON public.weather_alerts 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = weather_alerts.farm_id 
  AND farms.user_id = auth.uid()
));

CREATE POLICY "Users can create alerts for their farms" 
ON public.weather_alerts 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = weather_alerts.farm_id 
  AND farms.user_id = auth.uid()
));

CREATE POLICY "Users can update alerts for their farms" 
ON public.weather_alerts 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = weather_alerts.farm_id 
  AND farms.user_id = auth.uid()
));

CREATE POLICY "Users can delete alerts for their farms" 
ON public.weather_alerts 
FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = weather_alerts.farm_id 
  AND farms.user_id = auth.uid()
));