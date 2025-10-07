# Field Smart Link | Lokey & Co. Homestead

A modern agricultural management platform built with React, TypeScript, Supabase, and AI-powered features using Google Cloud APIs.

## 🚀 Features

- **Smart Farm Management**: Comprehensive farm and crop monitoring
- **AI-Powered Insights**: Intelligent agricultural advice using Google Cloud AI
- **Voice Interaction**: Text-to-speech and voice transcription in multiple languages (English, Tamil, Hindi)
- **Real-time Data**: Live updates using Supabase real-time subscriptions
- **Market Intelligence**: Agricultural market insights and pricing
- **Responsive Design**: Mobile-first design with modern UI components

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **AI Services**: Google Cloud Text-to-Speech, Speech-to-Text
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Deployment**: Vercel

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

## 🚀 Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/field-smart-link)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login and link project**
   ```bash
   vercel login
   vercel link
   ```

3. **Set environment variables**
   ```bash
   # Supabase configuration
   vercel env add VITE_SUPABASE_URL production
   vercel env add VITE_SUPABASE_ANON_KEY production
   
   # Google Cloud API key (for Supabase Edge Functions)
   vercel env add GEMINI_API_KEY production
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Environment Variables Required

| Variable | Description | Where to get it |
|----------|-------------|-----------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key | Supabase Dashboard > Settings > API |
| `GEMINI_API_KEY` | Google Cloud API key | Google Cloud Console > APIs & Services > Credentials |

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
npm run dev              # Start development server
npm run build           # Build for production
npm run build:dev       # Build for development
npm run preview         # Preview production build

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Deployment
npm run vercel-build    # Production build with type checking
```

## 🔍 Performance Monitoring

The application includes built-in performance monitoring that tracks:

- Page load times
- API call performance
- Component render times
- Core Web Vitals

Metrics are automatically sent to Vercel Analytics in production.

## 🛡️ Security Features

- Environment variable validation
- API key security (server-side only)
- Error boundary for graceful error handling
- Input validation and sanitization
- CORS configuration
- Rate limiting (via Supabase)

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

## Original Lovable Project Info

**URL**: https://lovable.dev/projects/8af5774b-eb1e-4a4b-b831-c938c39df33c

This project was created with [Lovable](https://lovable.dev) and enhanced for production deployment.