# Requirements Document

## Introduction

This feature involves migrating the current OpenAI-based text-to-speech and voice transcription services to Google's Gemini AI platform. The migration will replace OpenAI API calls with Gemini AI equivalents while maintaining the same functionality and adding support for environment variable configuration during Vercel deployment.

## Requirements

### Requirement 1

**User Story:** As a developer, I want to migrate from OpenAI to Gemini AI for text-to-speech functionality, so that I can use Google's AI services instead of OpenAI.

#### Acceptance Criteria

1. WHEN the text-to-speech function is called THEN the system SHALL use Gemini AI's text-to-speech API instead of OpenAI's API
2. WHEN a user requests text-to-speech in different languages (en, ta, hi) THEN the system SHALL maintain the same voice mapping functionality using Gemini AI voices
3. WHEN the text-to-speech API is called THEN the system SHALL return audio content in the same base64 format as before
4. WHEN text exceeds the maximum length THEN the system SHALL handle text truncation appropriately for Gemini AI limits

### Requirement 2

**User Story:** As a developer, I want to migrate from OpenAI to Gemini AI for voice transcription functionality, so that I can use Google's speech-to-text services.

#### Acceptance Criteria

1. WHEN the voice transcription function is called THEN the system SHALL use Gemini AI's speech-to-text API instead of OpenAI Whisper
2. WHEN audio data is provided in base64 format THEN the system SHALL convert and process it using Gemini AI's expected format
3. WHEN transcription is requested in different languages THEN the system SHALL support the same language codes (en, ta, hi)
4. WHEN transcription is successful THEN the system SHALL return the transcribed text in the same JSON format

### Requirement 3

**User Story:** As a DevOps engineer, I want to configure Gemini AI API keys as environment variables, so that I can securely deploy the application on Vercel without hardcoding credentials.

#### Acceptance Criteria

1. WHEN deploying to Vercel THEN the system SHALL read the Gemini AI API key from the GEMINI_API_KEY environment variable
2. WHEN the GEMINI_API_KEY environment variable is not set THEN the system SHALL return an appropriate error message
3. WHEN environment variables are configured THEN the system SHALL not expose API keys in logs or error messages
4. WHEN the application starts THEN the system SHALL validate that required environment variables are present

### Requirement 4

**User Story:** As a developer, I want to maintain backward compatibility with existing API contracts, so that frontend components don't need to be modified.

#### Acceptance Criteria

1. WHEN the migration is complete THEN the existing API endpoints SHALL maintain the same request/response format
2. WHEN frontend components call the TTS or transcription APIs THEN they SHALL receive responses in the same structure as before
3. WHEN errors occur THEN the system SHALL return error messages in the same format as the current implementation
4. WHEN the migration is deployed THEN existing functionality SHALL work without frontend code changes

### Requirement 5

**User Story:** As a system administrator, I want proper error handling and logging for Gemini AI integration, so that I can troubleshoot issues effectively.

#### Acceptance Criteria

1. WHEN Gemini AI API calls fail THEN the system SHALL log detailed error information without exposing sensitive data
2. WHEN API rate limits are exceeded THEN the system SHALL return appropriate HTTP status codes and error messages
3. WHEN network issues occur THEN the system SHALL handle timeouts and connection errors gracefully
4. WHEN debugging is needed THEN the system SHALL provide sufficient logging to trace request flow through Gemini AI services