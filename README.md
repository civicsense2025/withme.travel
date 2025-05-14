# withme.travel - Where Group Travel Dreams Come True Together

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.0-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-2.0-green)](https://supabase.io/)

## 🌍 Our Journey

withme.travel was born from a simple truth: planning trips with friends should be as fun as the adventures themselves. We've built the world's most delightful and collaborative group travel planning platform—where real-time collaboration meets authentic local content and powerful logistics tools.

**Our mission:** Make planning trips with friends as seamless, joyful and connected as the trips themselves.

## 💫 The withme.travel Experience

### For Travelers

Imagine you and your friends are planning a trip to Kyoto. Here's how withme.travel transforms that experience:

1. **Create a Trip** - Set up your Kyoto adventure in seconds, invite friends, and set basic parameters.
2. **Collaborate in Real-Time** - See who's online, track cursors as friends browse the same sections, and feel the energy of planning together.
3. **Build Your Itinerary Together** - Add activities, vote on preferences, and watch as your perfect trip takes shape. Our smart Itinerary Builder handles everything from scheduling to map visualization.
4. **Make Decisions as a Group** - Enter Focus Mode when it's time to decide on an accommodation or activity, with real-time voting and discussion.
5. **Stay in Sync** - Get notifications when someone comments on your suggestion or adds a must-see temple to the itinerary.
6. **Travel with Confidence** - Access all your plans offline, share expenses, and keep everyone on the same page during your adventure.

### For Destination Experts

Our platform also serves content creators and travel experts:

1. **Create Authentic Guides** - Share your local knowledge through our city profiles and itinerary templates.
2. **Build a Following** - Gain visibility as travelers use and love your recommendations.
3. **Provide Value** - Help groups discover hidden gems and authentic experiences they wouldn't find elsewhere.

## 🧩 Core Platform Components

Our platform integrates these key systems to create a seamless experience:

### 🔐 Authentication & User Management

- **Secure Authentication** with Supabase, supporting email/password and social login
- **User Profiles** with travel preferences, history, and connections
- **Guest Access** for trying the platform before signing up

### ✈️ Trip Management & Collaboration

- **Trip Creation Flow** with multi-step form and intuitive UX
- **Member Management** with role-based permissions (admin, editor, contributor, viewer)
- **Real-time Presence** showing who's online and what they're viewing
- **Focus Mode** for collaborative decision-making
- **Activity Timeline** tracking all trip updates and changes

### 📋 Itinerary Planning System

- **Collaborative Itinerary Builder** with drag-and-drop organization
- **Place Search & Integration** using Google Maps and Mapbox
- **Day & Timeline Visualization** for perfectly balanced schedules
- **Voting System** for group decision-making on activities and places
- **Offline Access** for referencing plans during travel

### 💬 Communication Layer

- **Universal Comment System** for discussions on any content type
- **Emoji Reactions** for quick feedback across the platform
- **Notifications** for keeping everyone informed of important updates
- **In-context Commenting** tied directly to itinerary items and decisions

### 🏙️ Content & Recommendations

- **City Profiles** with authentic insider knowledge
- **Itinerary Templates** for jumpstarting your planning
- **Activity Suggestions** based on group preferences
- **Local Insights** from destination experts

### 👥 Group Planning Features

- **Group Creation & Management** - Create groups independent of trips for ongoing travel planning
- **Group Plan Ideas** - Share and vote on destination ideas, dates, and activities
- **Collaborative Decision Making** - Tools to help groups reach consensus on destinations and dates
- **Group Members Management** - Add, remove, and manage group member roles and permissions

## 🗺️ Content Paths & Resources

### Trip & Itinerary Resources

- **Trip Dashboard**: `/trips/[id]`
- **Itinerary Builder**: `/trips/[id]/itinerary`
- **Group Budget Tracker**: `/trips/[id]/budget`
- **Trip Members**: `/trips/[id]/members`
- **Trip Notes**: `/trips/[id]/notes`
- **Focus Sessions**: `/trips/[id]/focus/[sessionId]`

### Destination Content

- **Destination Profiles**: `/destinations/[slug]`
- **City Guides**: `/cities/[slug]`
- **Country Profiles**: `/countries/[slug]`
- **Continent Overviews**: `/continents/[slug]`

### Template Resources

- **Template Library**: `/templates`
- **Template Details**: `/templates/[slug]`
- **Template Builder**: `/admin/itineraries/create`

### Group Features

- **Groups Dashboard**: `/groups`
- **Group Overview**: `/groups/[id]`
- **Group Plan Ideas**: `/groups/[id]/ideas`
- **Group Plans**: `/groups/[id]/plans/[planId]`

### User Resources

- **User Profile**: `/user/profile`
- **Friends & Connections**: `/user/friends`
- **Travel Preferences**: `/user/preferences`
- **Saved Trips**: `/user/trips`

### Administrative Resources

- **Admin Dashboard**: `/admin`
- **Content Management**: `/admin/content`
- **Destination Management**: `/admin/destinations`
- **Itinerary Management**: `/admin/itineraries`
- **User Management**: `/admin/users`
- **Analytics Dashboard**: `/admin/analytics`

## ⚙️ Technical Architecture

withme.travel is built with a modern, performance-focused stack:

### Frontend

- **Next.js 15** with App Router for blazing fast performance
- **React 18** with Server Components for optimal rendering
- **TypeScript** for robust type safety across the codebase
- **Tailwind CSS** with shadcn/ui components for beautiful, consistent UI
- **Supabase Client SDK** (@supabase/ssr) for real-time data

### Backend

- **Supabase PostgreSQL** database with Row Level Security
- **Supabase Auth** for authentication and authorization
- **Supabase Realtime** for live collaboration features
- **Next.js API Routes** for server-side logic and third-party integrations
- **Type-safe constants** for database tables and fields

### Infrastructure

- **Vercel** for global deployment and edge functions
- **Sentry** for error monitoring and performance tracking
- **Service Worker** for offline capabilities

## 📱 Mobile & Cross-Platform

- **Responsive Web Design** for all screen sizes
- **Progressive Web App** capabilities for installation
- **Offline Mode** for travel without connectivity
- **Native Mobile App** (coming soon)

## 🚀 Latest Achievements

We've recently enhanced withme.travel with these powerful capabilities:

- **Real-time Collaboration Engine** - See who's online, track cursors as friends browse the same sections, and collaborate in real-time.
- **Universal Comment System** - Comment on any content type with a consistent, intuitive interface.
- **Focus Mode** - A dedicated collaboration space for making group decisions efficiently.
- **Activity Timeline & Notifications** - Stay informed of all trip changes and updates.
- **Offline Support** - Access your trip plans even without an internet connection.
- **Authenticated API Architecture** - Robust, type-safe API routes with proper authentication.
- **Group Planning Features** - Create groups independent of trips for ongoing travel planning.

## 📈 Roadmap Highlights

We're continuously enhancing withme.travel, with these exciting features on the horizon:

- **Enhanced AI Recommendations** - Smarter activity suggestions based on group preferences
- **Mobile Apps** - Native iOS and Android experiences
- **Integration Ecosystem** - Connections with your favorite travel services
- **Advanced Expense Sharing** - More powerful budget tracking and cost splitting
- **Group Messaging** - In-app communication channels
- **Travel Booking Integration** - Direct booking capabilities for flights, accommodations, and activities
- **Trip Memory Albums** - Collaborative photo and memory sharing during and after trips

## 🧠 Design Philosophy

withme.travel is built on these core principles:

1. **Real-time by Default** - Collaboration is instantaneous and intuitive
2. **Authentic Content** - Local perspectives over generic tourist information
3. **Minimizing Friction** - Reducing clicks and complexity at every step
4. **Performance First** - Blazing fast experience on all devices
5. **Beautiful Simplicity** - Powerful features with intuitive interfaces
6. **Privacy by Design** - Granular controls over sharing and information visibility
7. **Group Consensus** - Tools that help groups make decisions without conflict

## 🛠️ Development Setup

### Prerequisites

- Node.js 18+ (we recommend using nvm)
- pnpm package manager
- Supabase account & CLI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/withme.travel.git
   cd withme.travel
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up environment variables:

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. Start the development server:

   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details on our code of conduct and submission process.

## 📖 Documentation

### Core Documentation

- [Authentication System](docs/authentication.md)
- [API Routes & Server/Client Components Guide](docs/api-routes-server-client.md)
- [Constants Guide](docs/constants-guide.md)
- [Content Guide](docs/CONTENT_GUIDE.md)
- [Codebase Structure](docs/CODEBASE_STRUCTURE.md)
- [Next.js Best Practices](docs/nextjs-best-practices.md)
- [TypeScript Best Practices](docs/typescript-best-practices.md)
- [Visual Styling Guide](docs/visual-styling-guide.md)

### Feature-Specific Documentation

- [Focus Session Context](docs/focus-session-context.md)
- [Collaboration Features](docs/collaboration-features.md)
- [Notification System Guide](docs/notification-system-guide.md)
- [Offline Support](docs/offline-support.md)
- [Itinerary Optimizations](docs/ITINERARY_OPTIMIZATIONS.md)
- [Itinerary Template Structure](docs/ITINERARY_TEMPLATE_STRUCTURE.md)

### Development Resources

- [Performance Optimizations](docs/performance-optimizations.md)
- [Database Structure](docs/database_structure.md)
- [Testing Guide](docs/testing.md)
- [Full Documentation Index](docs/DOCUMENTATION.md)

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ❓ Frequently Asked Questions

### General Questions

**Q: What makes withme.travel different from other travel planning tools?**  
A: Unlike other platforms, withme.travel focuses specifically on group travel planning with real-time collaboration at its core. We combine collaborative tools, authentic local content, and a seamless trip planning experience all in one place.

**Q: Is withme.travel free to use?**  
A: Yes! Our core planning features are free for all users. We offer premium features for enhanced collaboration, additional storage, and advanced tools for frequent travelers.

**Q: Can I use withme.travel on my phone?**  
A: Absolutely! Our platform is fully responsive and works on any device. We also support offline access so you can reference your plans even without internet connection.

### Trip Planning

**Q: How many people can I invite to plan a trip?**  
A: You can invite up to 20 people to collaborate on a single trip. Everyone can contribute ideas, vote on activities, and help shape the perfect itinerary.

**Q: Can I plan multiple trips at the same time?**  
A: Yes! You can create and manage multiple trips simultaneously. Your dashboard shows all your active trips and their planning status.

**Q: How do we decide where to go and what to do?**  
A: Our voting system lets everyone in your group express preferences, while Focus Mode helps you make final decisions efficiently. You can vote on dates, destinations, accommodations, and activities.

**Q: What if some of my friends don't want to create an account?**  
A: No problem! You can invite them as guests with a special link, allowing them to view and contribute to trip planning without creating a full account.

### Trip Management

**Q: Can I control who can edit our trip details?**  
A: Yes, as a trip creator you can assign different roles to members: Admin (full control), Editor (can modify most things), Contributor (can suggest and comment), or Viewer (read-only access).

**Q: How do I know when someone makes changes to our trip?**  
A: Our notification system alerts you when important changes happen, while the Activity Timeline shows a complete history of all updates. You'll also see real-time indicators when friends are online and editing.

**Q: Can we track our trip budget together?**  
A: Yes! The budget tracker lets you add estimated costs for all activities, accommodations, and transportation. Everyone can see the running total and contribute to expense tracking.

**Q: What happens to our trip plans during the actual trip?**  
A: Your entire itinerary is available offline, so you can access it even without internet. You can also make real-time adjustments during your trip as plans evolve.

### Content & Templates

**Q: Where does withme.travel's destination information come from?**  
A: Our city guides and local tips come from experienced travelers and local experts who share authentic, insider knowledge—not generic tourist information.

**Q: Can I create my own trip templates to share?**  
A: Yes! You can save any trip as a template and share it with friends or the wider withme.travel community.

**Q: How do I find inspiration for places to visit?**  
A: Browse our curated city guides, explore trending destinations, or check out popular itinerary templates from other travelers to spark ideas for your next adventure.

### Technical Support

**Q: What if I encounter a problem while using withme.travel?**  
A: Our help center provides tutorials and troubleshooting guides. You can also contact support through the in-app chat or by emailing help@withme.travel.

**Q: Is my trip data secure and private?**  
A: Absolutely. We use industry-standard encryption, and you control exactly who has access to your trip plans. Your data is never sold to third parties.

**Q: Can I export my trip plans to other formats?**  
A: Yes! You can export your itinerary to PDF, Google Calendar, or Apple Calendar for easy reference during your trip.

---

**withme.travel** – Transforming group trip planning from stress to success, one collaborative adventure at a time.
