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
    const { messages, language = 'en', image, document, documentName } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Received chat request with messages:', messages?.length, 'Language:', language);

    // Build system prompt with language support
    const languageInstructions: Record<string, string> = {
      en: 'Respond in English.',
      ta: 'தமிழில் பதிலளிக்கவும் (Respond in Tamil).',
      hi: 'हिंदी में जवाब दें (Respond in Hindi).'
    };

    const systemPrompt = `You are an expert agricultural advisor with decades of experience. ${languageInstructions[language as string] || languageInstructions.en}

Provide clear, actionable advice on:
- Crop management and cultivation techniques
- Pest and disease identification and treatment
- Soil health and fertilization strategies
- Irrigation and water management
- Climate adaptation and resilience
- Harvest timing and post-harvest handling
- Market trends and economic considerations

Always give specific, practical recommendations tailored to the farmer's situation. Use simple language and explain technical terms when necessary.`;

    let messageContent: any = messages;

    // Handle image analysis
    if (image) {
      const lastMessage = messages[messages.length - 1];
      messageContent = messages.slice(0, -1);
      messageContent.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: lastMessage.content || 'Analyze this agricultural image and provide detailed insights.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${image}`
            }
          }
        ]
      });
    }

    // Handle document analysis
    if (document) {
      const lastMessage = messages[messages.length - 1];
      messageContent = messages.slice(0, -1);
      messageContent.push({
        role: 'user',
        content: `Analyze this agricultural document (${documentName}) and provide insights: ${lastMessage.content || 'Provide a summary and recommendations.'}`
      });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messageContent,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        console.error('Payment required');
        return new Response(
          JSON.stringify({ error: "AI usage credits exhausted. Please add credits to continue." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-agronomist function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
