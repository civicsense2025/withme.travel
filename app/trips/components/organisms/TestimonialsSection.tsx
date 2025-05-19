// app/components/TestimonialsSection.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  avatar?: string;
  role: string;
  content: string;
  rating: number;
}

export function TestimonialsSection() {
  const testimonials: Testimonial[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      role: 'Frequent Traveler',
      content: 'This platform made planning our group trip to Italy so easy! The real-time collaboration saved us countless hours of back-and-forth.',
      rating: 5
    },
    {
      id: '2',
      name: 'Michael Chen',
      role: 'Travel Blogger',
      content: 'The itinerary builder is a game-changer. I can now create detailed plans and share them with my followers effortlessly.',
      rating: 5
    },
    {
      id: '3',
      name: 'Emily Wilson',
      avatar: '/avatars/emily.jpg',
      role: 'Family Traveler',
      content: 'Finally a tool that understands group travel! The expense tracking alone has saved us so many headaches on our family vacations.',
      rating: 4
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-b from-muted/30 to-background">
      <div className="container max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight mb-4">What Our Users Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Don't just take our word for it - hear from travelers who've transformed their trips
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <Card key={testimonial.id} className="p-6 h-full flex flex-col">
              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 mr-3">
                  {testimonial.avatar ? (
                    <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                  ) : null}
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{testimonial.name}</h3>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
              <div className="flex mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground flex-grow">"{testimonial.content}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}