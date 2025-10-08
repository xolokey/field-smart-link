# 🌾 Field Smart Link | Lokey & Co. Homestead

A comprehensive AI-powered agricultural management platform built with modern web technologies, featuring advanced monitoring, offline capabilities, and intelligent advisory services.

## ✨ Enhanced Features

### 🤖 AI-Powered Intelligence

- **Advanced AI Advisor**: Multi-modal chat with image and document analysis
- **Voice Interaction**: Text-to-speech and voice transcription in 3 languages (English, Tamil, Hindi)
- **Smart Recommendations**: Context-aware agricultural advice using Google Cloud AI
- **Real-time Processing**: Streaming responses with confidence scoring

### 📱 Progressive Web App (PWA)

- **Offline Functionality**: Full offline mode with data synchronization
- **Native App Experience**: Installable PWA with native-like features
- **Push Notifications**: Real-time alerts and updates
- **Cross-Platform**: Works seamlessly on desktop, tablet, and mobile

### 🔧 Advanced Monitoring & Analytics

- **Performance Dashboard**: Real-time performance metrics and Core Web Vitals
- **User Analytics**: Comprehensive user behavior tracking
- **Error Monitoring**: Advanced error boundary with detailed logging
- **Health Checks**: System status monitoring and diagnostics

### 🛡️ Enterprise Security

- **Input Validation**: Comprehensive security validation and sanitization
- **Rate Limiting**: Built-in API rate limiting and abuse prevention
- **Security Headers**: Full security header implementation
- **Environment Validation**: Startup validation and configuration checks

### 🎨 Enhanced User Experience

- **Modern UI**: Beautiful, accessible interface with shadcn/ui components
- **Multi-language Support**: Full internationalization (i18n) support
- **Responsive Design**: Mobile-first design with adaptive layouts
- **Loading States**: Sophisticated loading and skeleton components
- **Notification Center**: Comprehensive notification management system

## 🛠️ Advanced Tech Stack

### Frontend Architecture

- **React 18**: Latest React with Concurrent Features and Suspense
- **TypeScript**: Full type safety with advanced type definitions
- **Vite**: Lightning-fast build tool with HMR and optimizations
- **PWA**: Service Worker, Web App Manifest, offline capabilities

### UI/UX Framework

- **shadcn/ui**: Modern, accessible component library
- **Radix UI**: Unstyled, accessible UI primitives
- **Tailwind CSS**: Utility-first CSS with custom design system
- **Framer Motion**: Smooth animations and transitions (ready to integrate)

### Backend & Data

- **Supabase**: PostgreSQL database with real-time subscriptions
- **Edge Functions**: Serverless functions for AI processing
- **Row Level Security**: Database-level security policies
- **Real-time**: Live data synchronization

### AI & Machine Learning

- **Google Cloud AI**: Text-to-Speech and Speech-to-Text APIs
- **Gemini AI**: Advanced language model for agricultural advice
- **Multi-modal Processing**: Text, image, and document analysis
- **Streaming Responses**: Real-time AI response streaming

### Development & Deployment

- **Vercel**: Edge deployment with global CDN
- **GitHub Actions**: CI/CD pipeline (configurable)
- **ESLint & Prettier**: Code quality and formatting
- **Bundle Analysis**: Performance optimization tools

### Monitoring & Analytics

- **Vercel Analytics**: Built-in performance and usage analytics
- **Custom Metrics**: Application-specific performance tracking
- **Error Boundaries**: Comprehensive error handling and reporting
- **Health Checks**: System monitoring and diagnostics

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Google Cloud account with Text-to-Speech and Speech-to-Text APIs enabled
- Vercel account (for deployment)

## 🔧 Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd field-smart-link
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start development server**

   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:8080`

## 🚀 Production Deployment

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/field-smart-link)

### Comprehensive Deployment Guide

For detailed deployment instructions, see [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)

### Quick Start Deployment

1. **Prerequisites Setup**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Verify build works locally
   npm run type-check
   npm run build:prod
   ```

2. **Environment Configuration**

   ```bash
   # Login and link project
   vercel login
   vercel link

   # Set required environment variables
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   vercel env add GEMINI_API_KEY production
   ```

3. **Deploy with Optimizations**

   ```bash
   # Deploy to production with all features enabled
   vercel --prod

   # Verify deployment
   vercel inspect [deployment-url]
   ```

### Advanced Configuration

```bash
# Optional: Enable advanced features
vercel env add VITE_ENABLE_ANALYTICS true production
vercel env add VITE_ENABLE_PWA true production
vercel env add VITE_ENABLE_OFFLINE true production
vercel env add VITE_ENABLE_MONITORING true production
```

### Environment Variables Required

| Variable                 | Description               | Where to get it                                      |
| ------------------------ | ------------------------- | ---------------------------------------------------- |
| `VITE_SUPABASE_URL`      | Your Supabase project URL | Supabase Dashboard > Settings > API                  |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key    | Supabase Dashboard > Settings > API                  |
| `GEMINI_API_KEY`         | Google Cloud API key      | Google Cloud Console > APIs & Services > Credentials |

## 🔑 Google Cloud Setup

1. **Create Google Cloud Project**

   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project

2. **Enable APIs**

   ```bash
   gcloud services enable texttospeech.googleapis.com
   gcloud services enable speech.googleapis.com
   ```

3. **Create API Key**
   - Go to APIs & Services > Credentials
   - Create Credentials > API Key
   - Restrict the key to Text-to-Speech and Speech-to-Text APIs

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ErrorBoundary.tsx
├── config/             # Configuration files
│   └── environment.ts  # Environment variables config
├── integrations/       # External service integrations
│   └── supabase/      # Supabase client and types
├── pages/             # Route components
├── utils/             # Utility functions
│   └── performance.ts # Performance monitoring
└── App.tsx           # Main application component

supabase/
└── functions/         # Supabase Edge Functions
    ├── text-to-speech/    # TTS with Google Cloud
    └── voice-transcribe/  # STT with Google Cloud
```

## 🧪 Available Scripts

```bash
# Development
npm run dev              # Start development server with HMR
npm run build           # Build for production (optimized)
npm run build:dev       # Build for development (with source maps)
npm run build:prod      # Build for production (with build metadata)
npm run preview         # Preview production build locally

# Code Quality & Testing
npm run lint            # Run ESLint with advanced rules
npm run lint:fix        # Fix ESLint issues automatically
npm run type-check      # TypeScript type checking
npm run test            # Run test suite (when implemented)

# Analysis & Optimization
npm run analyze         # Analyze bundle size and dependencies
npm run vercel-build    # Production build with type checking (Vercel)

# Development Tools
npm run dev:debug       # Development with debug mode enabled
npm run dev:offline     # Development with offline mode testing
```

### Development Workflow

```bash
# Start development with all features
npm run dev

# Run quality checks before commit
npm run type-check && npm run lint

# Test production build locally
npm run build:prod && npm run preview

# Analyze bundle for optimization
npm run analyze
```

## � Advanced Monitoring & Analytics

### Performance Monitoring

- **Core Web Vitals**: FCP, LCP, FID, CLS tracking
- **Custom Metrics**: API response times, component render performance
- **Real-time Dashboard**: Live performance metrics (development mode)
- **Bundle Analysis**: Automated bundle size monitoring
- **Memory Usage**: JavaScript heap monitoring

### User Analytics

- **Session Tracking**: User journey and behavior analysis
- **Feature Usage**: Track feature adoption and usage patterns
- **Error Analytics**: Comprehensive error tracking and reporting
- **Performance Analytics**: User experience performance metrics

### System Health

- **Health Checks**: Automated system status monitoring
- **Environment Validation**: Startup configuration validation
- **API Monitoring**: Real-time API health and response time tracking
- **Offline Status**: Network connectivity and sync status monitoring

### Data Export

```bash
# Export performance metrics
# Available in development mode via Performance Dashboard
# Production metrics available in Vercel Analytics dashboard
```

## 🛡️ Enterprise Security Features

### Input Security

- **Comprehensive Validation**: Multi-layer input validation and sanitization
- **XSS Protection**: Advanced XSS prevention with CSP headers
- **File Upload Security**: Secure file handling with type and size validation
- **SQL Injection Prevention**: Parameterized queries and ORM protection

### API Security

- **Rate Limiting**: Built-in API rate limiting and abuse prevention
- **Authentication**: Secure JWT-based authentication via Supabase
- **Authorization**: Row-level security (RLS) policies
- **API Key Management**: Secure server-side API key handling

### Network Security

- **HTTPS Enforcement**: Automatic HTTPS redirection in production
- **Security Headers**: Comprehensive security header implementation
- **CORS Configuration**: Properly configured cross-origin resource sharing
- **Content Security Policy**: Strict CSP for XSS prevention

### Application Security

- **Environment Validation**: Startup security configuration validation
- **Error Handling**: Secure error handling without information leakage
- **Session Management**: Secure session handling and timeout
- **Audit Logging**: Security event logging and monitoring

### Compliance Ready

- **Data Privacy**: GDPR-compliant data handling practices
- **Security Scanning**: Regular dependency vulnerability scanning
- **Access Control**: Role-based access control (RBAC) ready
- **Encryption**: Data encryption in transit and at rest

## 🌐 Internationalization

The application supports multiple languages:

- English (en)
- Tamil (ta)
- Hindi (hi)

Voice features (TTS/STT) are available in all supported languages.

## 📊 Monitoring and Analytics

- **Vercel Analytics**: Automatic performance and usage analytics
- **Error Tracking**: Built-in error boundary with detailed logging
- **Performance Metrics**: Custom performance monitoring
- **Real-time Monitoring**: Supabase real-time features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

1. Check the [deployment checklist](deployment-checklist.md)
2. Review the [troubleshooting guide](deployment-checklist.md#troubleshooting-common-issues)
3. Open an issue on GitHub

## 🔄 Migration from OpenAI to Google Cloud

This project has been migrated from OpenAI to Google Cloud AI services. See the [migration documentation](.kiro/specs/openai-to-gemini-migration/) for details.

---
