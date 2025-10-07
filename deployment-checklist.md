# Vercel Deployment Checklist

## Pre-Deployment Setup

### 1. Google Cloud Configuration
- [ ] Create Google Cloud project
- [ ] Enable Text-to-Speech API
- [ ] Enable Speech-to-Text API  
- [ ] Generate API key with appropriate restrictions
- [ ] Test API key with curl commands

### 2. Supabase Configuration
- [ ] Supabase project is set up
- [ ] Edge Functions are deployed with updated code
- [ ] Database schema is up to date
- [ ] RLS policies are configured

### 3. Environment Variables Preparation
- [ ] `VITE_SUPABASE_URL` - Your Supabase project URL
- [ ] `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- [ ] `GEMINI_API_KEY` - Your Google Cloud API key (for Edge Functions)

## Vercel Deployment Steps

### 1. Connect Repository
```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link project to Vercel
vercel link
```

### 2. Set Environment Variables
```bash
# Set Supabase URL
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_URL preview  
vercel env add VITE_SUPABASE_URL development

# Set Supabase Anon Key
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_SUPABASE_ANON_KEY preview
vercel env add VITE_SUPABASE_ANON_KEY development

# Set Google Cloud API Key (for Supabase Edge Functions)
vercel env add GEMINI_API_KEY production
vercel env add GEMINI_API_KEY preview
vercel env add GEMINI_API_KEY development
```

### 3. Deploy
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Alternative: Vercel Dashboard Setup

### 1. Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your Git repository
4. Select "Vite" as framework preset

### 2. Configure Environment Variables
1. Go to Project Settings > Environment Variables
2. Add the following variables for all environments:

| Name | Value | Environment |
|------|-------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Production, Preview, Development |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview, Development |
| `GEMINI_API_KEY` | Your Google Cloud API key | Production, Preview, Development |

### 3. Deploy
1. Click "Deploy" 
2. Wait for build to complete
3. Test the deployed application

## Post-Deployment Verification

### 1. Frontend Testing
- [ ] Application loads correctly
- [ ] All routes work properly
- [ ] UI components render correctly
- [ ] No console errors

### 2. Supabase Integration Testing
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] Real-time features work (if applicable)

### 3. AI Features Testing
- [ ] Text-to-speech functionality works
- [ ] Voice transcription functionality works
- [ ] All supported languages work (en, ta, hi)
- [ ] Error handling works correctly

### 4. Performance Testing
- [ ] Page load times are acceptable
- [ ] Lighthouse scores are good
- [ ] Mobile responsiveness works
- [ ] PWA features work (if applicable)

## Troubleshooting Common Issues

### Build Failures
```bash
# Check build locally
npm run build

# Check TypeScript errors
npm run type-check

# Fix linting issues
npm run lint:fix
```

### Environment Variable Issues
```bash
# List current environment variables
vercel env ls

# Pull environment variables for local development
vercel env pull .env.local
```

### Supabase Edge Functions Issues
1. Check Supabase dashboard for function logs
2. Verify `GEMINI_API_KEY` is set correctly
3. Test functions individually in Supabase dashboard

### Performance Issues
1. Check bundle size with `npm run build`
2. Analyze with Vercel Analytics
3. Optimize images and assets
4. Enable compression in vercel.json

## Monitoring and Maintenance

### 1. Set Up Monitoring
- [ ] Vercel Analytics enabled
- [ ] Error tracking configured
- [ ] Performance monitoring set up

### 2. Regular Maintenance
- [ ] Monitor API usage and costs
- [ ] Update dependencies regularly
- [ ] Review and rotate API keys
- [ ] Monitor performance metrics

### 3. Backup Strategy
- [ ] Database backups configured
- [ ] Environment variables documented
- [ ] Deployment configuration versioned

## Security Checklist

- [ ] API keys are not exposed in client-side code
- [ ] Environment variables are properly configured
- [ ] CORS settings are appropriate
- [ ] Rate limiting is configured (if needed)
- [ ] SSL/HTTPS is enabled
- [ ] Security headers are configured