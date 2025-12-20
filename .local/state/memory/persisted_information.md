# Session Context - Heat Risk Early-Warning Application

## Current Status: READY FOR PUBLISHING
The application is ready for publishing with proper migration setup.

## Recent Fix Applied
**Issue**: Publishing failed with "constraint does not exist" error
**Solution**: Created proper Drizzle migrations with `IF EXISTS` clauses that won't fail on non-existent constraints

## Migration Setup
- Created `migrations/0000_init.sql` with safe idempotent SQL
- Created `migrations/meta/_journal.json` and `migrations/meta/0000_snapshot.json`
- Migration uses `CREATE TABLE IF NOT EXISTS` and `DROP CONSTRAINT IF EXISTS`
- Also cleans up stale `users` and `sessions` tables if they exist

## Key Configuration
- **Authentication**: Clerk with development keys (pk_test_..., sk_test_...)
- **Database**: PostgreSQL with user_preferences, saved_locations, weather_history tables
- **UserId**: varchar referencing Clerk user IDs (no foreign keys)

## App Features
- Real-time heat risk monitoring
- 7-day weather forecasts with heat index
- Air Quality Index integration
- User preferences (temperature unit)
- Saved locations
- Clerk authentication (Google, GitHub, email/password)

## Files Modified This Session
- migrations/0000_init.sql - Safe idempotent migration
- migrations/meta/_journal.json - Migration journal
- migrations/meta/0000_snapshot.json - Schema snapshot
- replit.md - Added troubleshooting section
