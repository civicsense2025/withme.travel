import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

const FeaturesSection: React.FC = () => (
  <section className="bg-muted py-16">
    <div className="max-w-6xl mx-auto px-4 mt-24 mb-24">
      <h2 className="text-5xl md:text-4xl font-bold text-center mb-24">
        Everything you need for the perfect trip
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              {/* Collaborative Planning Icon */}
              <span className="text-5xl">🤝</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Collaborative Planning</h3>
            <p className="text-muted-foreground">
              Plan together in real-time. Everyone can contribute ideas and build the perfect itinerary as a team.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              {/* Smart Itineraries Icon */}
              <span className='text-5xl'>🗂️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Itineraries</h3>
            <p className="text-muted-foreground">
              Organize your days with our intuitive itinerary builder. Map out activities, restaurants, and must-see spots.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
              {/* Travel Guides Icon */}
              <span className='text-5xl'>📖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Travel Guides</h3>
            <p className="text-muted-foreground">
              Access insider tips and destination guides written by locals and travel experts.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
);

export default FeaturesSection; 