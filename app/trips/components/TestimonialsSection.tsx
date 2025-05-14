import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users2, Globe, Calendar } from 'lucide-react';

const TestimonialsSection: React.FC = () => (
  <section className="py-16 px-4 max-w-6xl mx-auto">
    <div className="text-center mb-12 mt-24 mb-24">
      <h2 className="text-5xl md:text-5xl font-bold mb-4">Join thousands of happy travelers</h2>
      <p className="text-muted-foreground max-w-lg mx-auto">
        See why people love planning their trips with us
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="italic text-muted-foreground mb-4">
            "Planning our family reunion trip was so easy with this platform. Everyone could add their ideas, and we created the perfect itinerary together!"
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
              <Users2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Sarah Johnson</p>
              <p className="text-sm text-muted-foreground">Family trip to Hawaii</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card">
        <CardContent className="pt-6">
          <p className="italic text-muted-foreground mb-4">
            "The collaborative tools made coordinating our group trip to Europe so much easier. No more endless text threads and confusion!"
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
              <Globe className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Michael Chen</p>
              <p className="text-sm text-muted-foreground">Backpacking across Europe</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-card hidden lg:block">
        <CardContent className="pt-6">
          <p className="italic text-muted-foreground mb-4">
            "I love how our whole friend group can vote on activities and plan together. Made our weekend getaway stress-free and fun to organize!"
          </p>
          <div className="flex items-center">
            <div className="w-10 h-10 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Jessica Taylor</p>
              <p className="text-sm text-muted-foreground">Weekend trip to New York</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  </section>
);

export default TestimonialsSection; 