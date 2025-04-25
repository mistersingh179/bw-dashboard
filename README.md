# BW Dashboard

Web content dashboard for BrandWeaver.

## Setup

1. Clone the repository
2. Create environment files:
   - Copy `.env.template` to `.env` and fill in your values
   - Copy `docker-compose.yml.template` to `docker-compose.yml` and fill in your values

3. Start the database:
   ```
   docker compose up
   ```

4. Install dependencies:
   ```
   npm install
   ```

5. Run migrations:
   ```
   npx prisma migrate dev
   ```

6. Start the development server:
   ```
   npm run dev
   ```

## Development

### Commands

- Start the database: `docker compose up`
- Start the development server: `npm run dev`
- Run migrations: `npx prisma migrate dev`
- Build for production: `npm run build`
- Start production server: `npm start`
- Run a script: `tsx scripts/foo.ts`
- Open REPL: `prisma-repl --verbose`
- Check database health: `docker run -ti -e DATABASE_URL=$NEON_DB -p 8080:8080 ankane/pghero`

### Running Scripts

- `tsx scripts/foo.ts` - Run a script once
- `tsx watch scripts/foo.ts` - Run a script in watch mode for development
- `PINO_LOG_LEVEL=error node --loader tsx scripts/repl.ts` - Run a script with minimal logging

### Database

The project uses Prisma with PostgreSQL and Redis:

- **PostgreSQL**: Handles relational data storage
- **Redis**: Used for caching and job queues

Database connection variables are set in the `.env` file:
- `DATABASE_URL`: Main connection string (pooled)
- `DIRECT_URL`: Direct connection for migrations
- `SHADOW_DATABASE_URL`: Used by Prisma migrate

### Architecture

The application consists of:

1. **Dashboard UI**: NextJS-based management interface
2. **API Endpoints**: REST APIs for the client script
3. **Background Jobs**: Processing queues for content analysis
4. **Database**: PostgreSQL with Prisma ORM

## Internal Flow

1. User registers their domain(s)
2. System fetches the site's URLs from sitemap
3. Each webpage is processed to extract content
4. Content is matched with campaigns to generate scores
5. Advertisement spots are created for each relevant campaign
6. Client script retrieves appropriate content when loaded on a page

## License

MIT © 2025 MASALSA Inc.