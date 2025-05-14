'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  TicketIcon,
  FileText,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  ClockIcon,
  ExternalLink,
} from 'lucide-react';
import { ViatorBookingStatus } from './ViatorItineraryItemDetail';
import { Badge } from '@/components/ui/badge';
import { trackViatorLinkClick } from '@/utils/api/viator';

interface ViatorBooking {
  id: string;
  productId: string;
  productCode: string;
  title: string;
  imageUrl: string;
  date?: string;
  time?: string;
  price: string;
  location: string;
  productUrl: string;
  tripId?: string;
  tripName?: string;
  bookingStatus: ViatorBookingStatus;
}

interface ViatorBookingTrackerProps {
  userId: string;
}

export function ViatorBookingTracker({ userId }: ViatorBookingTrackerProps) {
  const [bookings, setBookings] = useState<ViatorBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  // Mock function to fetch bookings - would be replaced with real API call
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);

      try {
        // Simulate API delay
        await new Promise((r) => setTimeout(r, 1000));

        // Mock data - would come from the database in production
        const mockBookings: ViatorBooking[] = [
          {
            id: 'booking1',
            productId: '101',
            productCode: 'EIFFEL123',
            title: 'Skip-the-Line Eiffel Tower Tour with Summit Access',
            imageUrl: 'https://images.unsplash.com/photo-1543349689-9a4d426bee8e',
            date: '2023-10-15',
            time: '10:00 AM',
            price: '$89.99',
            location: 'Paris, France',
            productUrl: 'https://www.viator.com/tours/Paris/Skip-the-Line-Eiffel-Tower-Tour',
            tripId: 'trip123',
            tripName: 'Paris Adventure',
            bookingStatus: {
              status: 'confirmed',
              confirmationNumber: 'VTR-12345678',
              bookedAt: '2023-09-20T14:30:00Z',
              voucherUrl: 'https://www.viator.com/voucher/VTR-12345678',
            },
          },
          {
            id: 'booking2',
            productId: '102',
            productCode: 'COLO456',
            title: 'Colosseum Skip-the-Line Guided Tour',
            imageUrl: 'https://images.unsplash.com/photo-1552432552-06c0b6004b68',
            date: '2023-11-10',
            time: '9:30 AM',
            price: '$59.99',
            location: 'Rome, Italy',
            productUrl: 'https://www.viator.com/tours/Rome/Colosseum-Skip-the-Line-Tour',
            tripId: 'trip456',
            tripName: 'Italian Discovery',
            bookingStatus: {
              status: 'confirmed',
              confirmationNumber: 'VTR-87654321',
              bookedAt: '2023-09-25T10:15:00Z',
              voucherUrl: 'https://www.viator.com/voucher/VTR-87654321',
            },
          },
          {
            id: 'booking3',
            productId: '103',
            productCode: 'SAGRA789',
            title: 'Barcelona: Sagrada Familia Fast-Track Ticket',
            imageUrl: 'https://images.unsplash.com/photo-1583779457094-ab6f77f7bf57',
            date: '2023-09-05', // Past date
            time: '2:00 PM',
            price: '$35.99',
            location: 'Barcelona, Spain',
            productUrl: 'https://www.viator.com/tours/Barcelona/Sagrada-Familia-Fast-Track',
            tripId: 'trip789',
            tripName: 'Spanish Journey',
            bookingStatus: {
              status: 'confirmed',
              confirmationNumber: 'VTR-23456789',
              bookedAt: '2023-08-15T09:45:00Z',
              voucherUrl: 'https://www.viator.com/voucher/VTR-23456789',
            },
          },
          {
            id: 'booking4',
            productId: '104',
            productCode: 'ROBOT303',
            title: 'Tokyo: Robot Restaurant Show Ticket',
            imageUrl: 'https://images.unsplash.com/photo-1526400473556-aac12354f3db',
            date: '2023-12-20',
            time: '7:30 PM',
            price: '$79.99',
            location: 'Tokyo, Japan',
            productUrl: 'https://www.viator.com/tours/Tokyo/Robot-Restaurant',
            tripId: 'trip101112',
            tripName: 'Japan Explorer',
            bookingStatus: {
              status: 'pending',
              bookedAt: '2023-09-27T16:20:00Z',
            },
          },
        ];

        setBookings(mockBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [userId]);

  const handleVoucherView = async (booking: ViatorBooking) => {
    if (!booking.bookingStatus.voucherUrl) return;

    // Track the voucher access
    await trackViatorLinkClick(booking.bookingStatus.voucherUrl, {
      userId,
      tripId: booking.tripId,
      productCode: booking.productCode,
      pageContext: 'booking_tracker_voucher',
    });

    // Open voucher in new tab
    window.open(booking.bookingStatus.voucherUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBookingDetails = async (booking: ViatorBooking) => {
    // Track the click
    await trackViatorLinkClick(booking.productUrl, {
      userId,
      tripId: booking.tripId,
      productCode: booking.productCode,
      pageContext: 'booking_tracker_details',
    });

    // Open product page in new tab
    window.open(booking.productUrl, '_blank', 'noopener,noreferrer');
  };

  const isPastBooking = (date: string) => {
    return new Date(date) < new Date();
  };

  const upcomingBookings = bookings.filter(
    (booking) => booking.date && !isPastBooking(booking.date)
  );

  const pastBookings = bookings.filter((booking) => booking.date && isPastBooking(booking.date));

  const pendingBookings = bookings.filter((booking) => booking.bookingStatus.status === 'pending');

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="h-10 w-80 animate-pulse rounded-md bg-slate-200 dark:bg-slate-700"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="flex animate-pulse flex-col sm:flex-row">
                <div className="h-32 w-full bg-slate-200 dark:bg-slate-700 sm:h-auto sm:w-1/4"></div>
                <div className="p-4 space-y-3 w-full">
                  <div className="h-6 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 w-2/3 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-4 w-1/3 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                  <div className="h-8 w-1/4 rounded-md bg-slate-200 dark:bg-slate-700"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">Your Viator Bookings</h2>
        <p className="text-secondary-text">View and manage your tours and activity bookings</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="upcoming" className="relative">
            Upcoming
            {upcomingBookings.length > 0 && (
              <Badge className="ml-2 bg-accent-purple">{upcomingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pending">
            Pending
            {pendingBookings.length > 0 && (
              <Badge className="ml-2 bg-amber-500">{pendingBookings.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="space-y-4">
          {upcomingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No upcoming bookings</h3>
                <p className="mb-6 text-center text-secondary-text">
                  You don't have any upcoming tours or activities booked.
                </p>
                <Button>Book an Experience</Button>
              </CardContent>
            </Card>
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewVoucher={() => handleVoucherView(booking)}
                onViewDetails={() => handleBookingDetails(booking)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <ClockIcon className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No pending bookings</h3>
                <p className="text-center text-secondary-text">
                  You don't have any pending tour or activity bookings.
                </p>
              </CardContent>
            </Card>
          ) : (
            pendingBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewVoucher={() => handleVoucherView(booking)}
                onViewDetails={() => handleBookingDetails(booking)}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4">
          {pastBookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <h3 className="mb-2 text-xl font-semibold">No past bookings</h3>
                <p className="text-center text-secondary-text">
                  You don't have any completed tours or activities.
                </p>
              </CardContent>
            </Card>
          ) : (
            pastBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onViewVoucher={() => handleVoucherView(booking)}
                onViewDetails={() => handleBookingDetails(booking)}
                isPast
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Helper component for booking card
interface BookingCardProps {
  booking: ViatorBooking;
  onViewVoucher: () => void;
  onViewDetails: () => void;
  isPast?: boolean;
}

function BookingCard({ booking, onViewVoucher, onViewDetails, isPast = false }: BookingCardProps) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row">
        <div className="relative h-40 w-full sm:h-auto sm:w-1/3 md:w-1/4">
          <img src={booking.imageUrl} alt={booking.title} className="h-full w-full object-cover" />
          {booking.bookingStatus.status === 'confirmed' && (
            <div className="absolute left-2 top-2">
              <Badge className="bg-emerald-500">Confirmed</Badge>
            </div>
          )}
          {booking.bookingStatus.status === 'pending' && (
            <div className="absolute left-2 top-2">
              <Badge className="bg-amber-500">Pending</Badge>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <div>
            <h3 className="mb-1 text-lg font-bold">{booking.title}</h3>

            {booking.tripName && (
              <p className="text-sm text-secondary-text">
                Part of your <span className="font-medium">{booking.tripName}</span> trip
              </p>
            )}

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {booking.date && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={16} className="text-muted-foreground" />
                  <span>{new Date(booking.date).toLocaleDateString()}</span>
                </div>
              )}

              {booking.time && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={16} className="text-muted-foreground" />
                  <span>{booking.time}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm">
                <TicketIcon size={16} className="text-muted-foreground" />
                <span>{booking.price}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {booking.bookingStatus.status === 'confirmed' && booking.bookingStatus.voucherUrl && (
              <Button variant="outline" size="sm" className="h-8" onClick={onViewVoucher}>
                <FileText size={16} className="mr-1" />
                Voucher
              </Button>
            )}

            <Button
              variant={isPast ? 'ghost' : 'default'}
              size="sm"
              className={`h-8 ${isPast ? '' : 'bg-accent-purple hover:bg-accent-purple/90'}`}
              onClick={onViewDetails}
            >
              {isPast ? 'View Details' : 'Booking Details'}
              <ExternalLink size={16} className="ml-1" />
            </Button>

            {booking.bookingStatus.status === 'confirmed' &&
              booking.bookingStatus.confirmationNumber && (
                <div className="ml-auto flex items-center text-xs text-secondary-text">
                  <span className="font-medium">Confirmation #:</span>
                  <span className="ml-1">{booking.bookingStatus.confirmationNumber}</span>
                </div>
              )}
          </div>
        </div>
      </div>
    </Card>
  );
}
