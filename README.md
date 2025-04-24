# Group travel app

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/civicsense2025s-projects/v0-group-travel-app)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/AQ2xd3AvaCR)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/civicsense2025s-projects/v0-group-travel-app](https://vercel.com/civicsense2025s-projects/v0-group-travel-app)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/AQ2xd3AvaCR](https://v0.dev/chat/projects/AQ2xd3AvaCR)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Splitwise Integration

The app now supports Splitwise integration to help groups track and split expenses during trips.

### Setup

1. Create a Splitwise Developer account and register a new app at [https://secure.splitwise.com/oauth_clients](https://secure.splitwise.com/oauth_clients)

2. Set the redirect URI to `https://your-domain.com/api/splitwise/callback` (or `http://localhost:3000/api/splitwise/callback` for local development)

3. Add the following environment variables to your `.env.local` file:
   ```
   SPLITWISE_CLIENT_ID=your-splitwise-client-id
   SPLITWISE_CLIENT_SECRET=your-splitwise-client-secret
   ```

4. Run the migration to create the necessary database tables:
   ```bash
   psql -U postgres -d your_database -f migrations/20231125_create_splitwise_connections_table.sql
   ```
   Or apply the migration through the Supabase Dashboard.

### Features

- **Connect Splitwise**: Users can connect their Splitwise accounts to the app
- **Link Trips to Groups**: Trip owners can link their trips to specific Splitwise groups
- **Real-time Expense Tracking**: All expenses in the linked Splitwise group appear in the trip budget
- **Settle Up**: When a trip is over, users can easily settle up directly through Splitwise