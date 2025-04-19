# Slotjack Deployment

This directory contains the production build for the Slotjack application.

## Deployment Instructions

1. Install dependencies:
```bash
npm install --production
```

2. Start the production server:
```bash
npm start
```

## Environment Variables

Make sure the following environment variables are properly configured:
- DATABASE_URL: Supabase connection URL
- SUPABASE_URL: Supabase project URL
- SUPABASE_KEY: Supabase project API key
- NEXT_PUBLIC_SUPABASE_URL: Publicly accessible Supabase URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY: Public anon key for Supabase

## Notes

- The application is built with Next.js 14.1.0
- The production build uses server-side rendering for dynamic routes and static generation for static routes
- The slug name conflict between `[id]` and `[userId]` has been resolved
