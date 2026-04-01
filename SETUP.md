# AECircle — aircraft.engineer Setup Guide

## Your Supabase is already configured
URL: https://vfdreolpfdztxhnedsmu.supabase.co
(credentials already in src/lib/supabase.ts)

## FIRST: Fix email confirmation in Supabase (takes 2 minutes)
1. Go to supabase.com → your AEC project
2. Click Authentication → Settings
3. Turn OFF "Enable email confirmations"
4. Save — this fixes the login issue immediately

## Run locally (on your laptop)
1. Install Node.js from nodejs.org (free, one time)
2. Open terminal in this folder
3. Run: npm install
4. Run: npm run dev
5. Open browser: http://localhost:5173

## Deploy to Netlify (free hosting)
1. Go to netlify.com → sign up free
2. Drag and drop this entire folder onto the Netlify dashboard
3. It builds and gives you a live URL instantly
4. Then point aircraft.engineer to that Netlify URL

## Connect aircraft.engineer domain
1. In Netlify: Site settings → Domain management → Add custom domain
2. Type: aircraft.engineer
3. Netlify shows you DNS settings to copy
4. Go to your domain registrar → update DNS records
5. Live in 24 hours

## Your routes
- aircraft.engineer/         → Landing page + sign in
- aircraft.engineer/cv       → Engineer profile (the hero feature)
- aircraft.engineer/jobs     → Jobs (coming soon)
- aircraft.engineer/trainings → Trainings (coming soon)  
- aircraft.engineer/academy  → EASA Part 66 courses (coming soon)
