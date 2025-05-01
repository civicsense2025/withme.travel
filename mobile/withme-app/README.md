# WithMe Travel Mobile App

This is the mobile application for WithMe Travel, built with Expo and React Native.

## Features

- Authentication with Supabase
- Trip management and viewing
- Itinerary planning
- Real-time collaboration
- Offline capabilities

## Setup Instructions

### Prerequisites

- Node.js 16+ installed
- npm or yarn package manager
- Expo CLI: `npm install -g expo-cli` (optional)
- Expo Go app on your iOS or Android device for testing

### Installation

1. Clone the repository (if you haven't already)
2. Navigate to the mobile app directory
3. Install dependencies:

```bash
npm install
```

4. Create a `.env` file based on `.env.example` with your Supabase credentials:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual Supabase URL and anonymous key.

### Running the App

```bash
# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

## Project Structure

```
withme-app/
├── assets/               # Static assets like images and fonts
├── src/
│   ├── components/       # Reusable UI components
│   ├── constants/        # App constants and configuration
│   ├── hooks/            # Custom React hooks
│   ├── navigation/       # Navigation configuration
│   ├── screens/          # App screens
│   ├── services/         # API and service integrations
│   ├── shared/           # Code shared with web app
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── App.tsx               # Main app entry point
├── app.config.js         # Expo configuration
├── babel.config.js       # Babel configuration
└── tsconfig.json         # TypeScript configuration
```

## Code Sharing with Web App

The mobile app is designed to share code with the WithMe Travel web application. Common logic, types, and utilities are placed in the `src/shared` directory for reuse between platforms.

## Development Guidelines

- Follow TypeScript best practices
- Use React Query for data fetching
- Implement offline-first features where possible
- Test on both iOS and Android platforms

## Authentication and Backend Integration

The app uses Supabase for authentication and backend integration, similar to the web version. Authentication tokens are securely stored using Expo SecureStore.
