# SkyLog Development TODO

## Current Next Step

- [ ] Create the NestJS backend application structure in `skylog-backend` (`src/main.ts`, app module, health endpoint)
- [ ] Add backend `dev`, `build`, `start`, `start:dev`, and `lint` scripts
- [ ] Add TypeScript, NestJS, and test configuration for the backend
- [ ] Add a backend `.env.example` and document required environment variables
- [ ] Start the backend locally and verify the health endpoint responds

## Backend Foundation

- [ ] Configure global validation with `ValidationPipe`
- [ ] Configure CORS for the Expo frontend development URL
- [ ] Add centralized error handling and request logging
- [ ] Add a consistent API response and error format
- [ ] Add health checks for the API, PostgreSQL, and Redis
- [ ] Add unit and integration test commands

## Database and Authentication

- [ ] Confirm the PostgreSQL schema for users, profiles, saved locations, weather history, and alerts
- [ ] Configure TypeORM entities and migrations
- [ ] Add database connection configuration using environment variables
- [ ] Decide whether Supabase Auth or backend JWT is the source of truth
- [ ] Implement authentication guards and current-user lookup
- [ ] Add authorization checks so users can access only their own data

## Backend API Modules

- [ ] Add profile endpoints for reading and updating profile data
- [ ] Add saved-location endpoints for create, list, update, and delete
- [ ] Add weather aggregation endpoints that call the existing external APIs securely
- [ ] Add air-quality, flood, earthquake, marine, elevation, and climate endpoints as needed
- [ ] Add disaster-risk calculation endpoints using `disasterLogic`
- [ ] Add archive/history endpoints for stored weather and climate data
- [ ] Add Socket.IO events only where real-time updates are required
- [ ] Add BullMQ/Redis jobs for scheduled data collection and alert processing

## Frontend Integration

- [ ] Add a single frontend API client with the backend base URL
- [ ] Move secrets and external API calls out of the mobile app where appropriate
- [ ] Connect sign-in and sign-up screens to the selected auth flow
- [ ] Connect profile and saved-location screens to backend endpoints
- [ ] Update weather and risk hooks to use backend responses
- [ ] Add loading, empty, offline, and API-error states
- [ ] Verify Android, iOS, and web network configuration separately

## Verification and Release

- [ ] Test all endpoints with valid, invalid, unauthorized, and not-found requests
- [ ] Test external API timeout, rate-limit, and partial-failure behavior
- [ ] Verify database migrations on a clean database
- [ ] Add API documentation or an OpenAPI/Swagger page
- [ ] Add development and production environment documentation
- [ ] Verify backend and frontend can run independently from their subfolders
- [ ] Verify the app on a device/emulator: weather fetch no longer times out or degrades gracefully
- [ ] Fix the existing frontend lint error in `components/home/WeatherBrief.tsx`
- [ ] Resolve remaining frontend lint warnings before release
