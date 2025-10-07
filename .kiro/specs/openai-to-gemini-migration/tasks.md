# Implementation Plan

- [x] 1. Update text-to-speech function for Google Cloud TTS integration
  - Replace OpenAI API endpoint with Google Cloud Text-to-Speech API
  - Update environment variable from OPENAI_API_KEY to GEMINI_API_KEY
  - Implement Google Cloud TTS request format and voice mapping
  - Maintain existing response format for frontend compatibility
  - _Requirements: 1.1, 1.2, 1.3, 3.1, 3.2, 4.1, 4.2_

- [ ]* 1.1 Write unit tests for voice mapping function
  - Create tests for language to Google Cloud voice mapping
  - Test edge cases for unsupported languages
  - _Requirements: 1.2, 5.1_

- [x] 2. Update voice transcription function for Google Cloud Speech-to-Text integration
  - Replace OpenAI Whisper API with Google Cloud Speech-to-Text API
  - Update request format to match Google Cloud STT expectations
  - Implement language code mapping for supported languages
  - Handle audio format conversion for Google Cloud STT
  - _Requirements: 2.1, 2.2, 2.3, 3.1, 3.2, 4.1, 4.2_

- [ ]* 2.1 Write unit tests for language mapping and audio processing
  - Test language code conversion for all supported languages
  - Test audio format handling and base64 conversion
  - _Requirements: 2.2, 2.3, 5.1_

- [x] 3. Implement comprehensive error handling for Google Cloud APIs
  - Add error mapping from Google Cloud error codes to HTTP status codes
  - Implement proper logging without exposing sensitive information
  - Add validation for GEMINI_API_KEY environment variable
  - Handle rate limiting and quota exceeded scenarios
  - _Requirements: 3.2, 3.3, 5.1, 5.2, 5.3, 5.4_

- [ ]* 3.1 Write unit tests for error handling scenarios
  - Test API key validation logic
  - Test error response formatting
  - Test rate limiting error handling
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 4. Update environment variable configuration
  - Replace OPENAI_API_KEY references with GEMINI_API_KEY
  - Add environment variable validation at function startup
  - Update error messages to reference correct environment variable
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 5. Verify API contract compatibility
  - Ensure request/response formats match existing frontend expectations
  - Test that error responses maintain the same structure
  - Validate that audio output format is compatible with frontend audio players
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 5.1 Write integration tests for API compatibility
  - Test end-to-end TTS functionality with sample requests
  - Test end-to-end STT functionality with sample audio
  - Test error scenarios return expected response format
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 6. Add deployment configuration documentation
  - Create documentation for setting GEMINI_API_KEY in Vercel environment variables
  - Document required Google Cloud API permissions
  - Add troubleshooting guide for common deployment issues
  - _Requirements: 3.1, 3.2_