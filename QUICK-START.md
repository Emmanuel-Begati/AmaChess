# AmaChess Quick Start Guide

## Option 1: SQLite (Recommended for Quick Setup)

Your Prisma schema is already configured for SQLite. This is the easiest option:

### 1. Update your `.env` file

Replace the PostgreSQL DATABASE_URL with SQLite:

```bash
cd amachess-backend
```

Edit `.env` and change:
```
DATABASE_URL="postgresql://amachess_user:YOUR_DB_PASSWORD@localhost:5432/amachess_production?schema=public"
```

To:
```
DATABASE_URL="file:./dev.db"
```

### 2. Initialize the database

```bash
npm run db:generate
npm run db:migrate
```

### 3. (Optional) Seed with puzzles

```bash
npm run db:seed
```

### 4. Start the server

```bash
npm start
```

Visit: http://localhost:3060

---

## Option 2: PostgreSQL (Production Setup)

If you want to use PostgreSQL instead:

### 1. Run the database setup script

```bash
./setup-database.sh
```

This will show you the commands to create the database and user.

### 2. Update Prisma schema

Edit `amachess-backend/prisma/schema.prisma` and change:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

To:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 3. Update your `.env` with the generated credentials

The setup script will provide the DATABASE_URL.

### 4. Initialize the database

```bash
cd amachess-backend
npm run db:generate
npm run db:migrate
```

### 5. Start the server

```bash
npm start
```

---

## Troubleshooting

### "Can't reach database server"
- For SQLite: Make sure DATABASE_URL="file:./dev.db" in your .env
- For PostgreSQL: Make sure PostgreSQL is running and credentials are correct

### "Prisma Client not generated"
Run: `npm run db:generate`

### Frontend not showing
Make sure you built it: `cd amachess-frontend && npm run build`

### API calls failing with ERR_CONNECTION_REFUSED to port 3001
The frontend was rebuilt with the correct API URLs. If you still see this:
1. Clear your browser cache
2. Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
3. Rebuild frontend: `./rebuild-frontend.sh`

---

## Development vs Production

**Development** (hot reload):
- Frontend: `cd amachess-frontend && npm run dev`
- Backend: `cd amachess-backend && npm run dev`

**Production** (single server):
- Build frontend: `cd amachess-frontend && npm run build`
- Start backend: `cd amachess-backend && npm start`
- Access: http://localhost:3060
