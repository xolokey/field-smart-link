import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Google Cloud Speech-to-Text language mapping
const languageMap: Record<string, string> = {
  'en': 'en-US',
  'ta': 'ta-IN',
  'hi': 'hi-IN',
};

// Error mapping for Google Cloud API responses
function mapGoogleCloudError(status: number, errorText: string): { status: number; message: string } {
  switch (status) {
    case 400:
      return { status: 400, message: "Invalid audio format or request parameters" };
    case 401:
      return { status: 401, message: "Invalid API key or authentication failed" };
    case 403:
      return { status: 403, message: "API access forbidden or quota exceeded" };
    case 413:
      return { status: 413, message: "Audio file too large" };
    case 429:
      return { status: 429, message: "Rate limit exceeded, please try again later" };
    case 500:
      return { status: 500, message: "Google Cloud service temporarily unavailable" };
    case 503:
      return { status: 503, message: "Google Cloud service overloaded, please retry" };
    default:
      return { status: 500, message: `Speech-to-text service error: ${status}` };
  }
}

// Validate environment variables at startup
function validateEnvironment(): string {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not configured");
    throw new Error("Speech-to-text service is not properly configured");
  }
  if (apiKey.length < 10) {
    console.error("GEMINI_API_KEY appears to be invalid (too short)");
    throw new Error("Speech-to-text service is not properly configured");
  }
  return apiKey;
}

// Validate base64 audio data
function validateAudioData(audio: string): void {
  if (!audio || typeof audio !== "string") {
    throw new Error("Audio data is required and must be a string");
  }
  
  if (audio.trim().length === 0) {
    throw new Error("Audio data cannot be empty");
  }

  // Basic base64 validation
  try {
    atob(audio.substring(0, 100)); // Test decode a small portion
  } catch {
    throw new Error("Invalid base64 audio data format");
  }

  // Check reasonable size limits (roughly 10MB base64 encoded)
  if (audio.length > 14000000) {
    throw new Error("Audio file too large");
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment first
    const GEMINI_API_KEY = validateEnvironment();

    // Parse and validate request
    const requestBody = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });
    
    const { audio, language = 'en' } = requestBody;
    
    console.log('STT request received:', { 
      audioLength: audio?.length, 
      language,
      hasValidKey: !!GEMINI_API_KEY,
    });
    
    // Validate audio data
    validateAudioData(audio);

    // Get language code for Google Cloud STT
    const languageCode = languageMap[language] || languageMap['en'];

    console.log('Calling Google Cloud Speech-to-Text API with language:', languageCode);

    // Send to Google Cloud Speech-to-Text API
    const response = await fetch(`https://speech.googleapis.com/v1/speech:recognize?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        config: {
          encoding: 'WEBM_OPUS',
          sampleRateHertz: 48000,
          languageCode: languageCode,
          enableAutomaticPunctuation: true,
        },
        audio: {
          content: audio, // base64 encoded audio
        },
      }),
    });

    console.log('Google Cloud STT response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unable to read error response");
      const errorInfo = mapGoogleCloudError(response.status, errorText);
      
      console.error("STT API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        mappedMessage: errorInfo.message,
      });
      
      return new Response(
        JSON.stringify({ error: errorInfo.message }),
        {
          status: errorInfo.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const result = await response.json().catch(() => {
      throw new Error("Invalid response format from Google Cloud Speech-to-Text");
    });
    
    console.log('STT successful, transcription received');

    // Extract transcript from Google Cloud STT response with validation
    if (!result.results || !Array.isArray(result.results)) {
      console.warn("No transcription results returned from STT API");
      return new Response(
        JSON.stringify({ text: "" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const transcript = result.results?.[0]?.alternatives?.[0]?.transcript || '';
    
    if (!transcript) {
      console.warn("Empty transcript returned from STT API");
    }

    return new Response(
      JSON.stringify({ text: transcript }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Error in voice-transcribe function:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    });

    // Determine appropriate status code based on error type
    let status = 500;
    let message = "Internal server error";

    if (error instanceof Error) {
      if (error.message.includes("not configured") || error.message.includes("authentication")) {
        status = 503;
        message = "Service temporarily unavailable";
      } else if (error.message.includes("required") || error.message.includes("invalid") || error.message.includes("empty") || error.message.includes("format") || error.message.includes("large")) {
        status = 400;
        message = error.message;
      } else if (error.message.includes("JSON")) {
        status = 400;
        message = "Invalid request format";
      } else {
        message = "Speech-to-text service error";
      }
    }

    return new Response(
      JSON.stringify({ error: message }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
