'use client';

import { ViatorBookingTracker } from '@/components/features/viator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ViatorItineraryItemDetail } from '@/components/features/viator/ViatorItineraryItemDetail';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ViatorBookingsDemo() {
  const [sampleBooking, setSampleBooking] = useState({
    status: 'not_booked' as const,
  });

  const handleUpdateBooking = (bookingData: any) => {
    setSampleBooking(bookingData);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6 flex items-center">
        <Link href="/viator-demo">
          <Button variant="ghost" className="mr-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Viator Demo
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Viator Bookings Demo</h1>
      </div>
      <Tabs defaultValue="bookings">
        <TabsList className="mb-6">
          <TabsTrigger value="bookings">My Bookings</TabsTrigger>
          <TabsTrigger value="detail">Booking Detail View</TabsTrigger>
        </TabsList>

        <TabsContent value="bookings">
          <Card>
            <CardHeader>
              <CardTitle>User Bookings Interface</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-secondary-text">
                This shows how users can view and manage their Viator bookings across all their
                trips in one consolidated view.
              </p>

              <ViatorBookingTracker userId="user123" />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detail">
          <Card>
            <CardHeader>
              <CardTitle>Itinerary Item Detail View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-secondary-text">
                This demonstrates how a Viator experience appears in the itinerary with different
                booking statuses. Click "Book Now" to see the booking confirmation state.
              </p>

              <div className="grid gap-6">
                <ViatorItineraryItemDetail
                  id="sample1"
                  title="Skip-the-Line Eiffel Tower Tour with Summit Access"
                  description="Skip the long lines at the Eiffel Tower with this tour that includes summit access. Enjoy the best views of Paris!"
                  imageUrl="https://images.unsplash.com/photo-1543349689-9a4d426bee8e"
                  price="$89.99"
                  duration="2 hours"
                  date="Oct 15, 2023"
                  time="10:00 AM"
                  location="Paris, France"
                  productUrl="https://www.viator.com/tours/Paris/Skip-the-Line-Eiffel-Tower-Tour"
                  productCode="EIFFEL123"
                  labels={['Skip-the-Line', 'Guided Tour']}
                  tripId="trip123"
                  booking={sampleBooking}
                  onUpdateBooking={handleUpdateBooking}
                />

                <ViatorItineraryItemDetail
                  id="sample2"
                  title="Paris: Louvre Museum Timed-Entrance Ticket"
                  description="Skip the long lines and save time with this timed-entrance ticket to the Louvre Museum. See famous works like the Mona Lisa and Venus de Milo."
                  imageUrl="https://images.unsplash.com/photo-1565784331762-48b2376c8853"
                  price="$35.99"
                  duration="Flexible"
                  location="Paris, France"
                  productUrl="https://www.viator.com/tours/Paris/Louvre-Museum-Ticket"
                  productCode="LOUVRE456"
                  labels={['Museum', 'Skip-the-Line']}
                  tripId="trip123"
                  booking={{
                    status: 'pending',
                    bookedAt: new Date().toISOString(),
                  }}
                />

                <ViatorItineraryItemDetail
                  id="sample3"
                  title="Seine River Dinner Cruise"
                  description="Enjoy a luxurious dinner while cruising along the Seine River with views of illuminated Paris landmarks."
                  imageUrl="https://images.unsplash.com/photo-1499856871958-5b9627545d1a"
                  price="$120.00"
                  duration="2.5 hours"
                  date="Oct 16, 2023"
                  time="7:30 PM"
                  location="Paris, France"
                  productUrl="https://www.viator.com/tours/Paris/Seine-Dinner-Cruise"
                  productCode="SEINE789"
                  labels={['Dinner', 'Cruise', 'Evening']}
                  tripId="trip123"
                  booking={{
                    status: 'confirmed',
                    confirmationNumber: 'VTR-87654321',
                    bookedAt: new Date(Date.now() - 86400000).toISOString(),
                    voucherUrl: 'https://www.viator.com/voucher/VTR-87654321',
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
