import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Google Cloud TTS voice mapping
const voiceMap: Record<
  string,
  { languageCode: string; name: string; ssmlGender: string }
> = {
  en: { languageCode: "en-US", name: "en-US-Neural2-A", ssmlGender: "NEUTRAL" },
  ta: { languageCode: "ta-IN", name: "ta-IN-Standard-A", ssmlGender: "FEMALE" },
  hi: { languageCode: "hi-IN", name: "hi-IN-Neural2-A", ssmlGender: "FEMALE" },
};

// Error mapping for Google Cloud API responses
function mapGoogleCloudError(
  status: number,
  errorText: string
): { status: number; message: string } {
  switch (status) {
    case 400:
      return { status: 400, message: "Invalid request format or parameters" };
    case 401:
      return {
        status: 401,
        message: "Invalid API key or authentication failed",
      };
    case 403:
      return { status: 403, message: "API access forbidden or quota exceeded" };
    case 429:
      return {
        status: 429,
        message: "Rate limit exceeded, please try again later",
      };
    case 500:
      return {
        status: 500,
        message: "Google Cloud service temporarily unavailable",
      };
    case 503:
      return {
        status: 503,
        message: "Google Cloud service overloaded, please retry",
      };
    default:
      return {
        status: 500,
        message: `Text-to-speech service error: ${status}`,
      };
  }
}

// Validate environment variables at startup
function validateEnvironment(): string {
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) {
    console.error("GEMINI_API_KEY environment variable is not configured");
    throw new Error("Text-to-speech service is not properly configured");
  }
  if (apiKey.length < 10) {
    console.error("GEMINI_API_KEY appears to be invalid (too short)");
    throw new Error("Text-to-speech service is not properly configured");
  }
  return apiKey;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate environment first
    const GEMINI_API_KEY = validateEnvironment();

    // Parse and validate request
    const requestBody = await req.json().catch(() => {
      throw new Error("Invalid JSON in request body");
    });

    const { text, language = "en" } = requestBody;

    console.log("TTS request received:", {
      textLength: text?.length,
      language,
      hasValidKey: !!GEMINI_API_KEY,
    });

    // Input validation
    if (!text || typeof text !== "string") {
      console.error("Invalid or missing text parameter");
      throw new Error("Text parameter is required and must be a string");
    }

    if (text.trim().length === 0) {
      console.error("Empty text provided");
      throw new Error("Text cannot be empty");
    }

    if (text.length > 5000) {
      console.warn("Text length exceeds limit, truncating:", text.length);
    }

    // Get voice configuration for the requested language
    const voiceConfig = voiceMap[language] || voiceMap["en"];

    console.log("Calling Google Cloud TTS API with voice:", voiceConfig);

    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: text.substring(0, 5000) }, // Google Cloud TTS limit
          voice: {
            languageCode: voiceConfig.languageCode,
            name: voiceConfig.name,
            ssmlGender: voiceConfig.ssmlGender,
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }
    );

    console.log("Google Cloud TTS response status:", response.status);

    if (!response.ok) {
      const errorText = await response
        .text()
        .catch(() => "Unable to read error response");
      const errorInfo = mapGoogleCloudError(response.status, errorText);

      console.error("TTS API error:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        mappedMessage: errorInfo.message,
      });

      return new Response(JSON.stringify({ error: errorInfo.message }), {
        status: errorInfo.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json().catch(() => {
      throw new Error("Invalid response format from Google Cloud TTS");
    });

    console.log("TTS successful, audio content received");

    // Validate response structure
    if (!result.audioContent) {
      console.error("Missing audioContent in TTS response");
      throw new Error("Invalid response from text-to-speech service");
    }

    const base64Audio = result.audioContent;

    return new Response(JSON.stringify({ audioContent: base64Audio }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in text-to-speech function:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      type: error?.constructor?.name,
    });

    // Determine appropriate status code based on error type
    let status = 500;
    let message = "Internal server error";

    if (error instanceof Error) {
      if (
        error.message.includes("not configured") ||
        error.message.includes("authentication")
      ) {
        status = 503;
        message = "Service temporarily unavailable";
      } else if (
        error.message.includes("required") ||
        error.message.includes("invalid") ||
        error.message.includes("empty")
      ) {
        status = 400;
        message = error.message;
      } else if (error.message.includes("JSON")) {
        status = 400;
        message = "Invalid request format";
      } else {
        message = "Text-to-speech service error";
      }
    }

    return new Response(JSON.stringify({ error: message }), {
      status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
