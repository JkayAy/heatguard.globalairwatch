# Heat Risk Early-Warning Application

## Overview

A real-time heat risk monitoring web application that provides location-based weather data, heat index calculations, and safety guidance. The application helps users stay informed about dangerous heat conditions by displaying current weather conditions, hourly forecasts, and risk-level categorizations with corresponding health recommendations.

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
- Material Design principles combined with weather app best practices

**Design System:**
- Typography: Inter/Roboto font family via Google Fonts
- Custom color palette with CSS variables supporting light/dark modes
- Consistent spacing scale using Tailwind's spacing units (2, 4, 6, 8, 12, 16)
- Responsive breakpoints with mobile-first approach

**State Management:**
- React Query for asynchronous data fetching and caching (10-minute stale time for weather data)
- Local React state for UI interactions (search, dropdowns, mobile menu)
- Custom hooks for reusable logic (useAuth, usePreferences, useTemperatureUnit, use-mobile, use-toast)
- Temperature unit preference dynamically applied across all displays

**Component Structure:**
- Atomic design pattern with ui components as primitives
- Feature-specific components (WeatherCard, HourlyForecast, HealthGuidance, RiskBadge)
- Shared utility components (ErrorDisplay, LoadingSkeleton)

### Backend Architecture

**Server Framework:**
- Express.js running on Node.js with TypeScript
- ESM module system for modern JavaScript syntax

**API Design:**
- RESTful endpoints for geocoding and weather data
- Authentication endpoints via Replit OpenID Connect
- Route structure:
  - `/api/login` - Initiate Replit Auth login flow
  - `/api/logout` - Log out and clear session
  - `/api/callback` - OAuth callback handler
  - `/api/auth/user` - Get current authenticated user (protected)
  - `/api/preferences` - Get/update user preferences (protected)
  - `/api/saved-locations` - CRUD for saved locations (protected)
  - `/api/weather-history` - Get historical weather data (public)
  - `/api/geocoding/search?q={query}` - Location search (public)
  - `/api/geocoding/reverse?lat={lat}&lon={lon}` - Reverse geocoding (public)
  - `/api/weather?latitude={lat}&longitude={lon}&name={name}...` - Weather data (public)

**Caching Strategy:**
- NodeCache for in-memory API response caching
- 10-minute TTL (stdTTL: 600) for weather data
- 2-minute cleanup interval (checkperiod: 120)
- Reduces external API calls and improves response times

**Data Processing:**
- Server-side heat index calculations using NOAA algorithm
- Temperature conversions (Celsius ↔ Fahrenheit)
- Risk level categorization based on heat index thresholds:
  - Normal: < 80°F
  - Caution: 80-90°F
  - Extreme Caution: 91-102°F
  - Danger: 103-124°F
  - Extreme Danger: ≥ 125°F

**Development vs Production:**
- Vite middleware integration in development for HMR
- Static file serving in production from dist/public
- Environment-based configuration through NODE_ENV
- Session cookies: secure=false in development (HTTP), secure=true in production (HTTPS)
- Auth callback URLs dynamically generated from request protocol and host

**Authentication:**
- Replit Auth (OpenID Connect) for user authentication
- Supports Google, GitHub, X, Apple, and email/password login methods
- Session storage in PostgreSQL with 7-day TTL
- Automatic token refresh for expired sessions
- Protected routes require valid authentication

### Data Storage

**Current Implementation:**
- PostgreSQL database via Neon serverless driver with DatabaseStorage class
- Full user authentication and session management via Replit Auth (OpenID Connect)
- Persistent user preferences and saved locations

**Database Schema:**
- **users**: User accounts from Replit Auth (id, email, firstName, lastName, profileImageUrl)
- **sessions**: Express session storage for authentication (required for Replit Auth)
- **user_preferences**: User settings (temperatureUnit: C|F, emailAlertsEnabled, alertEmail)
- **saved_locations**: User's saved locations with default flag
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
- External weather API (implementation suggests Open-Meteo or similar)
- Provides current conditions and hourly forecasts
- Returns temperature, humidity, and apparent temperature data

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