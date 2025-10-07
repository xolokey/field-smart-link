# Deployment Configuration Guide

## Overview

This guide explains how to configure the `GEMINI_API_KEY` environment variable for deploying the migrated text-to-speech and voice transcription functions on Vercel.

## Google Cloud API Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID for reference

### 2. Enable Required APIs

Enable the following APIs in your Google Cloud project:

- **Cloud Text-to-Speech API**
- **Cloud Speech-to-Text API**

```bash
# Using gcloud CLI (optional)
gcloud services enable texttospeech.googleapis.com
gcloud services enable speech.googleapis.com
```

### 3. Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Copy the generated API key
4. **Recommended**: Restrict the API key to only the required APIs:
   - Click on the API key to edit
   - Under "API restrictions", select "Restrict key"
   - Choose "Cloud Text-to-Speech API" and "Cloud Speech-to-Text API"

## Vercel Deployment Configuration

### Setting Environment Variables in Vercel

#### Method 1: Vercel Dashboard

1. Go to your project in the [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to **Settings > Environment Variables**
3. Add a new environment variable:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Google Cloud API key
   - **Environment**: Select all environments (Production, Preview, Development)
4. Click **Save**

#### Method 2: Vercel CLI

```bash
# Set for production
vercel env add GEMINI_API_KEY production

# Set for preview
vercel env add GEMINI_API_KEY preview

# Set for development
vercel env add GEMINI_API_KEY development
```

#### Method 3: vercel.json Configuration

Add to your `vercel.json` file (not recommended for security):

```json
{
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

Then add the secret:

```bash
vercel secrets add gemini-api-key "your-actual-api-key"
```

### Deployment Commands

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel

# Check environment variables
vercel env ls
```

## Security Best Practices

### API Key Security

- ✅ **DO**: Store API keys as environment variables
- ✅ **DO**: Restrict API keys to specific APIs in Google Cloud Console
- ✅ **DO**: Use different API keys for different environments
- ❌ **DON'T**: Commit API keys to version control
- ❌ **DON'T**: Hardcode API keys in source code
- ❌ **DON'T**: Share API keys in plain text

### Google Cloud Security

1. **Enable API Key Restrictions**:
   - Restrict to specific APIs (Text-to-Speech, Speech-to-Text)
   - Consider IP restrictions if applicable
2. **Monitor Usage**:
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console
3. **Rotate Keys Regularly**:
   - Generate new API keys periodically
   - Update environment variables when rotating

## Troubleshooting

### Common Issues

#### 1. "Service not properly configured" Error

**Cause**: Missing or invalid `GEMINI_API_KEY`
**Solution**:

- Verify the environment variable is set in Vercel
- Check that the API key is valid in Google Cloud Console
- Ensure the key has access to required APIs

#### 2. "Authentication failed" Error (401)

**Cause**: Invalid API key
**Solution**:

- Regenerate API key in Google Cloud Console
- Update environment variable in Vercel
- Redeploy the application

#### 3. "API access forbidden" Error (403)

**Cause**: API not enabled or quota exceeded
**Solution**:

- Enable Text-to-Speech and Speech-to-Text APIs in Google Cloud
- Check billing account is active
- Review quota limits in Google Cloud Console

#### 4. "Rate limit exceeded" Error (429)

**Cause**: Too many requests
**Solution**:

- Implement client-side rate limiting
- Consider upgrading Google Cloud quotas
- Add retry logic with exponential backoff

### Debugging Steps

1. **Check Environment Variables**:

   ```bash
   vercel env ls
   ```

2. **Test API Key Locally**:

   ```bash
   curl -X POST \
     "https://texttospeech.googleapis.com/v1/text:synthesize?key=YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"input":{"text":"test"},"voice":{"languageCode":"en-US","name":"en-US-Neural2-A"},"audioConfig":{"audioEncoding":"MP3"}}'
   ```

3. **Check Function Logs**:

   - View logs in Vercel Dashboard
   - Look for specific error messages
   - Check if API key validation passes

4. **Verify API Enablement**:
   - Go to Google Cloud Console > APIs & Services > Enabled APIs
   - Confirm both Text-to-Speech and Speech-to-Text APIs are enabled

## Cost Considerations

### Google Cloud Pricing

- **Text-to-Speech**: ~$4.00 per 1 million characters
- **Speech-to-Text**: ~$1.44 per hour of audio
- **Free Tier**: Limited monthly usage included

### Optimization Tips

- Cache frequently requested audio content
- Implement client-side text length limits
- Use appropriate audio quality settings
- Monitor usage in Google Cloud Console

## Migration Checklist

- [ ] Create Google Cloud project
- [ ] Enable Text-to-Speech and Speech-to-Text APIs
- [ ] Generate and restrict API key
- [ ] Set `GEMINI_API_KEY` in Vercel environment variables
- [ ] Remove old `OPENAI_API_KEY` environment variable
- [ ] Deploy and test both TTS and STT functions
- [ ] Verify error handling works correctly
- [ ] Set up monitoring and billing alerts
- [ ] Update any documentation referencing OpenAI

## Support Resources

- [Google Cloud Text-to-Speech Documentation](https://cloud.google.com/text-to-speech/docs)
- [Google Cloud Speech-to-Text Documentation](https://cloud.google.com/speech-to-text/docs)
- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google Cloud API Key Best Practices](https://cloud.google.com/docs/authentication/api-keys)
