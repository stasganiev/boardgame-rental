# Supabase Setup

## Apply migrations

Go to your Supabase project → SQL Editor → run each file in order:

1. `migrations/001_create_users.sql`

## Storage buckets

Create two public buckets in Storage:
- `avatars` — for user profile photos
- `game-photos` — for game instance photos

## Auth settings

In Authentication → Settings:
- Enable Email provider ✅
- Disable email confirmations for local dev (optional)
- Set Site URL: http://localhost:3000
- Add Redirect URL: http://localhost:3000/*

## Environment variables

See `../.env.example` for required variables.
