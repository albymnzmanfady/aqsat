# Server

This directory contains the Express.js backend server with SQLite database.

## Structure

- `db.ts` - Database setup, schema, and seed data
- `index.ts` - Express server with all API routes

## Development

```bash
npm run dev:server     # Run server only
npm run dev            # Run frontend only
npm run dev:full       # Run both
```

## Production

```bash
npm run build          # Build frontend
npm start              # Run production server
```

The production server serves both the API and the built frontend static files.