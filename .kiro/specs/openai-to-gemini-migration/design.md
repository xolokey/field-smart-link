# Design Document

## Overview

This design outlines the migration from OpenAI services to Google's Gemini AI platform for text-to-speech and voice transcription functionality. The migration will replace OpenAI API endpoints with Google Cloud Text-to-Speech and Speech-to-Text APIs while maintaining the existing API contracts and adding proper environment variable configuration for Vercel deployment.

## Architecture

### Current Architecture
- Supabase Edge Functions handling TTS and transcription requests
- OpenAI API for text-to-speech (tts-1 model)
- OpenAI Whisper API for voice transcription
- Environment variable: `OPENAI_API_KEY`

### Target Architecture
- Supabase Edge Functions (unchanged structure)
- Google Cloud Text-to-Speech API for TTS functionality
- Google Cloud Speech-to-Text API for transcription
- Environment variable: `GEMINI_API_KEY` (Google Cloud API key)

### API Migration Strategy

#### Text-to-Speech Migration
- **From:** OpenAI TTS API (`https://api.openai.com/v1/audio/speech`)
- **To:** Google Cloud Text-to-Speech API (`https://texttospeech.googleapis.com/v1/text:synthesize`)

#### Voice Transcription Migration
- **From:** OpenAI Whisper API (`https://api.openai.com/v1/audio/transcriptions`)
- **To:** Google Cloud Speech-to-Text API (`https://speech.googleapis.com/v1/speech:recognize`)

## Components and Interfaces

### 1. Text-to-Speech Service (`supabase/functions/text-to-speech/index.ts`)

#### Input Interface (Unchanged)
```typescript
{
  text: string;
  language?: 'en' | 'ta' | 'hi';
}
```

#### Output Interface (Unchanged)
```typescript
{
  audioContent: string; // base64 encoded audio
}
```

#### Google Cloud TTS Request Format
```typescript
{
  input: { text: string };
  voice: {
    languageCode: string;
    name: string;
    ssmlGender: 'NEUTRAL' | 'FEMALE' | 'MALE';
  };
  audioConfig: {
    audioEncoding: 'MP3';
    sampleRateHertz?: number;
  };
}
```

#### Voice Mapping Strategy
```typescript
const voiceMap: Record<string, { languageCode: string; name: string; ssmlGender: string }> = {
  'en': { languageCode: 'en-US', name: 'en-US-Neural2-A', ssmlGender: 'NEUTRAL' },
  'ta': { languageCode: 'ta-IN', name: 'ta-IN-Standard-A', ssmlGender: 'FEMALE' },
  'hi': { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'FEMALE' },
};
```

### 2. Voice Transcription Service (`supabase/functions/voice-transcribe/index.ts`)

#### Input Interface (Unchanged)
```typescript
{
  audio: string; // base64 encoded audio
  language?: 'en' | 'ta' | 'hi';
}
```

#### Output Interface (Unchanged)
```typescript
{
  text: string;
}
```

#### Google Cloud Speech-to-Text Request Format
```typescript
{
  config: {
    encoding: 'WEBM_OPUS';
    sampleRateHertz: 48000;
    languageCode: string;
    enableAutomaticPunctuation: true;
  };
  audio: {
    content: string; // base64 encoded audio
  };
}
```

#### Language Code Mapping
```typescript
const languageMap: Record<string, string> = {
  'en': 'en-US',
  'ta': 'ta-IN',
  'hi': 'hi-IN',
};
```

## Data Models

### Environment Configuration
```typescript
interface EnvironmentConfig {
  GEMINI_API_KEY: string; // Google Cloud API key with TTS and STT permissions
}
```

### API Response Models

#### Google Cloud TTS Response
```typescript
interface GoogleTTSResponse {
  audioContent: string; // base64 encoded audio
}
```

#### Google Cloud STT Response
```typescript
interface GoogleSTTResponse {
  results: Array<{
    alternatives: Array<{
      transcript: string;
      confidence: number;
    }>;
  }>;
}
```

## Error Handling

### Error Categories
1. **Authentication Errors**: Invalid or missing API key
2. **API Quota Errors**: Rate limiting or quota exceeded
3. **Input Validation Errors**: Invalid audio format or text length
4. **Network Errors**: Connection timeouts or service unavailable

### Error Response Format (Unchanged)
```typescript
{
  error: string; // Human-readable error message
}
```

### Error Mapping Strategy
- Map Google Cloud error codes to appropriate HTTP status codes
- Maintain existing error message format for frontend compatibility
- Log detailed error information without exposing sensitive data

## Testing Strategy

### Unit Testing
- Test voice mapping functions for all supported languages
- Test error handling for various failure scenarios
- Test environment variable validation
- Test audio format conversion utilities

### Integration Testing
- Test end-to-end TTS functionality with Google Cloud APIs
- Test end-to-end STT functionality with Google Cloud APIs
- Test error scenarios with invalid API keys
- Test rate limiting behavior

### Manual Testing
- Verify audio quality matches or exceeds OpenAI TTS quality
- Test transcription accuracy for all supported languages
- Verify deployment works correctly on Vercel with environment variables

## Implementation Considerations

### API Key Management
- Use Google Cloud API key with appropriate permissions for TTS and STT
- Configure as `GEMINI_API_KEY` environment variable in Vercel
- Validate API key presence at function startup

### Audio Format Handling
- Google Cloud TTS returns base64 encoded audio directly
- Google Cloud STT expects base64 encoded audio in request body
- Maintain existing base64 encoding/decoding logic where possible

### Rate Limiting
- Google Cloud APIs have different rate limits than OpenAI
- Implement appropriate retry logic with exponential backoff
- Consider caching strategies for frequently requested content

### Performance Optimization
- Google Cloud APIs may have different latency characteristics
- Monitor response times and optimize request parameters
- Consider regional API endpoints for better performance

### Migration Strategy
- Implement feature flags to allow gradual rollout
- Maintain OpenAI integration temporarily for rollback capability
- Test thoroughly in staging environment before production deployment