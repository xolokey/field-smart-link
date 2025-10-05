import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, location } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use AI to generate weather insights and disaster warnings
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: `You are a weather and disaster monitoring AI for agriculture. Provide concise, actionable weather forecasts and natural disaster warnings for the given location. Include:
- Current weather conditions
- 7-day forecast with temperature, precipitation, wind
- Agricultural alerts (frost, drought, excessive rain, storms)
- Natural disaster warnings (floods, hurricanes, extreme heat)
- Recommended actions for farmers

Format the response as JSON with these fields:
{
  "current": { "temp": number, "conditions": string, "humidity": number },
  "forecast": [{ "day": string, "temp_high": number, "temp_low": number, "conditions": string, "precipitation": number }],
  "alerts": [{ "type": string, "severity": string, "message": string, "action": string }],
  "recommendations": [string]
}` 
          },
          { 
            role: "user", 
            content: `Generate weather forecast and alerts for location: ${location || `${latitude}, ${longitude}`}` 
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`Weather AI error: ${response.status}`);
    }

    const data = await response.json();
    const weatherData = data.choices[0].message.content;

    // Try to parse as JSON, fallback to text
    let parsedWeather;
    try {
      parsedWeather = JSON.parse(weatherData);
    } catch {
      parsedWeather = { raw: weatherData };
    }

    return new Response(
      JSON.stringify(parsedWeather),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in weather-alerts function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
