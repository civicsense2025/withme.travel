/**
 * Homepage
 *
 * Main landing page for the application
 */

import React from 'react';
import { PopularDestinations } from '@/components/destinations/templates/PopularDestinations';
import { getPopularDestinations } from '@/lib/api/destinations';

/**
 * Homepage component displaying the main landing page
 */
export default async function HomePage() {
  // Try to get popular destinations
  let destinations;
  try {
    destinations = await getPopularDestinations(6);
  } catch (error) {
    console.error('Error fetching popular destinations:', error);
    // Continue rendering page even if destinations can't be fetched
  }

  return (
    <main>
      {/* Hero section - kept from original */}
      <section className="py-20 md:py-28 bg-gradient-to-b from-background to-muted/50">
        <div className="container">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Plan your next adventure together
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Create, collaborate, and enjoy seamless group travel planning with friends and family
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/trips/new"
                className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium"
              >
                Start planning
              </a>
              <a
                href="/destinations"
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90 px-8 py-3 rounded-md font-medium"
              >
                Explore destinations
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Popular destinations section using our new component */}
      <section className="py-16 md:py-24">
        <div className="container">
          <PopularDestinations
            destinations={destinations}
            title="Popular Destinations"
            subtitle="Discover amazing places for your next trip"
            showViewAll={true}
            viewAllUrl="/destinations"
          />
        </div>
      </section>

      {/* Features section - kept from original */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose withme.travel?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform makes group travel planning simple, collaborative, and fun
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-Time Collaboration</h3>
              <p className="text-muted-foreground">
                Plan together with friends in real-time, see who's online, and make decisions as a
                group.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Itineraries</h3>
              <p className="text-muted-foreground">
                Build detailed trip itineraries with activities, reservations, and travel details
                all in one place.
              </p>
            </div>

            <div className="bg-background p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                  <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Shared Expenses</h3>
              <p className="text-muted-foreground">
                Track group expenses, split costs fairly, and settle up easily with integrated
                expense management.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
