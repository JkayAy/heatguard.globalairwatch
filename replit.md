# Heat Risk Early-Warning Application

## Overview

A production-ready real-time heat risk monitoring web application that provides location-based weather data, 7-day extended forecasts, heat index calculations, and safety guidance. The application features custom-branded authentication, comprehensive weather visualization with daily forecasts, risk trend analysis, and personalized health recommendations to help users stay informed about dangerous heat conditions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server for fast hot module replacement
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Framework:**
- shadcn/ui component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens
- Professional, trustworthy design inspired by NOAA/government weather services

**Design System:**
- Typography: Inter/Roboto font family via Google Fonts
- Clean neutral color palette (white/light backgrounds, no warm gradients)
- Professional hero section with NOAA-branded badge and calm appearance
- Simplified footer with essential attribution only (no placeholder links)
- Consistent spacing scale using Tailwind's spacing units (2, 4, 6, 8, 12, 16)
- Responsive breakpoints with mobile-first approach

**Design Philosophy:**
- Trustworthy over flashy: Clean, professional appearance like government weather services
- Honest presentation: Only show links and features that actually exist
- Credibility through attribution: Prominent Open-Meteo and NOAA references
- Calm reassurance: Neutral colors instead of urgent heat warning aesthetics

**State Management:**
- React Query for asynchronous data fetching and caching (10-minute stale time for weather data)
- Local React state for UI interactions (search, dropdowns, mobile menu)
- Custom hooks for reusable logic (useAuth, usePreferences, useTemperatureUnit, use-mobile, use-toast)
- Temperature unit preference dynamically applied across all displays

**Component Structure:**
- Atomic design pattern with ui components as primitives
- Feature-specific components (WeatherCard, HourlyForecastTimeline, DailyForecastCard, RiskTrendVisualization, HealthGuidance, AirQualityCard)
- Shared utility components (ErrorDisplay, LoadingSkeleton)
- Layout components (HeroSection, Footer) with professional, trustworthy design

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with TypeScript
- ESM module system for modern JavaScript syntax

**API Design:**
- RESTful endpoints for geocoding and weather data
- Custom authentication system using passport-local
- Route structure:
  - `/api/auth/signup` - Create new user account (public)
  - `/api/auth/login` - Authenticate user with email/password (public)
  - `/api/auth/logout` - Destroy session (authenticated)
  - `/api/auth/user` - Get current authenticated user (protected)
  - `/api/auth/forgot-password` - Request password reset email (public)
  - `/api/auth/reset-password` - Reset password with token (public)
  - `/api/auth/verify-email` - Verify email address with token (public)
  - `/api/auth/resend-verification` - Resend verification email (authenticated)
  - `/api/preferences` - Get/update user preferences (protected)
  - `/api/saved-locations` - CRUD for saved locations (protected)
  - `/api/weather-history` - Get historical weather data (public)
  - `/api/geocoding/search?q={query}` - Location search (public)
  - `/api/geocoding/reverse?lat={lat}&lon={lon}` - Reverse geocoding (public)
  - `/api/weather?latitude={lat}&longitude={lon}&name={name}...` - Weather data with 7-day forecast (public)

**Caching Strategy:**
- NodeCache for in-memory API response caching
- 10-minute TTL (stdTTL: 600) for weather data
- 2-minute cleanup interval (checkperiod: 120)
- Reduces external API calls and improves response times

**Data Processing:**
- Server-side heat index calculations using NOAA algorithm for both maximum and minimum temperatures
- Temperature conversions (Celsius ↔ Fahrenheit) for API integration and display
- Risk level categorization based on heat index thresholds:
  - Normal: < 80°F
  - Caution: 80-90°F
  - Extreme Caution: 91-102°F
  - Danger: 103-124°F
  - Extreme Danger: ≥ 125°F
- 7-day daily forecast processing with precipitation probability and wind speed
- Air Quality Index (AQI) integration with EPA standard levels:
  - Good: 0-50
  - Moderate: 51-100
  - Unhealthy for Sensitive: 101-150
  - Unhealthy: 151-200
  - Very Unhealthy: 201-300
  - Hazardous: 301+
- Combined heat + air quality health impact warnings

**Development vs Production:**
- Vite middleware integration in development for HMR
- Static file serving in production from dist/public
- Environment-based configuration through NODE_ENV
- Session cookies: secure=false in development (HTTP), secure=true in production (HTTPS)
- Auth callback URLs dynamically generated from request protocol and host

**Authentication:**
- Custom email/password authentication using passport-local strategy
- Bcrypt password hashing (10 salt rounds) for secure credential storage
- SHA-256 token hashing for email verification and password reset tokens
- Session storage in PostgreSQL with connect-pg-simple and 7-day TTL
- Rate limiting on authentication endpoints (5-15 requests per 15 minutes)
- Email verification REQUIRED before login (users must verify email via Resend before accessing app)
- Secure password reset flow with token expiration (1 hour)
- Session invalidation on password change for security
- Protected routes require valid authentication
- Production-ready security measures (HTTPS in production, secure cookies)
- Seamless navigation: logout redirects to home, all auth pages have "Back to Home" links

### Data Storage

**Current Implementation:**
- PostgreSQL database via Neon serverless driver with DatabaseStorage class
- Full user authentication and session management
- Persistent user preferences and saved locations

**Database Schema:**
- **users**: User accounts with bcrypt-hashed passwords (id, email, firstName, lastName, passwordHash, isVerified, verificationToken, resetToken)
- **sessions**: Express session storage (sid, sess, expire) managed by connect-pg-simple
- **user_preferences**: User settings (temperatureUnit: C|F, emailAlertsEnabled, alertEmail)
- **saved_locations**: User's saved locations with default flag and user relationship
- **weather_history**: Historical weather records with location and risk data

**Database Configuration:**
- Drizzle ORM for type-safe database queries
- Migration via `npm run db:push` command
- Foreign keys with cascade delete for user-related data
- Indexes on latitude/longitude and recorded dates for efficient history queries
- 4-decimal coordinate precision in cache keys (~11m accuracy)

**Schema Design:**
- Zod schemas for runtime validation of API responses and data types
- Type-safe models generated from Drizzle table schemas
- Shared schema definitions between client and server
- Insert schemas with validation via drizzle-zod

### External Dependencies

**Weather Data Provider:**
- Open-Meteo API for comprehensive weather data
- Provides current conditions, hourly forecasts (24 hours), and 7-day daily forecasts
- Returns temperature (max/min), humidity, apparent temperature, precipitation probability, and wind speed
- Free tier with no API key required (rate-limited by IP)

**Air Quality Data Provider:**
- Open-Meteo Air Quality API for real-time AQI data
- Provides US AQI, PM2.5, and PM10 measurements
- Non-fatal integration: weather data returns even if AQI unavailable
- Cached alongside weather data (10-minute TTL)
- Free tier with no API key required

**Geocoding Service:**
- Location search and coordinate resolution
- Returns standardized location objects with name, coordinates, country, and administrative region

**Third-party Libraries:**
- **Axios**: HTTP client for external API requests
- **date-fns**: Date formatting and manipulation
- **Radix UI**: Accessible component primitives (20+ components)
- **class-variance-authority**: Type-safe component variants
- **cmdk**: Command palette functionality
- **Lucide React**: Icon library

**Google Fonts CDN:**
- Inter and Roboto font families
- Additional fonts: Architects Daughter, DM Sans, Fira Code, Geist Mono

**Development Tools:**
- Replit-specific plugins for runtime error overlay, cartographer, and dev banner
- TypeScript for static type checking
- ESBuild for production bundling

**Build & Deployment:**
- Development: tsx for TypeScript execution with watch mode
- Production: Vite for frontend bundling, ESBuild for backend bundling
- Target: ESM format with Node.js platform for server code