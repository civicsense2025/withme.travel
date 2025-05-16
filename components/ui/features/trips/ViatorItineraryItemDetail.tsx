'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Ticket, ExternalLink, FileText, Check } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trackViatorLinkClick } from '@/utils/api/viator';

export interface ViatorBookingStatus {
  status: 'not_booked' | 'pending' | 'confirmed' | 'canceled';
  confirmationNumber?: string;
  bookedAt?: string;
  voucherUrl?: string;
}

export interface ViatorItineraryItemDetailProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  price: string;
  duration: string;
  date?: string;
  time?: string;
  location: string;
  productUrl: string;
  productCode: string;
  labels?: string[];
  tripId?: string;
  booking?: ViatorBookingStatus;
  onUpdateBooking?: (bookingData: ViatorBookingStatus) => void;
}

export function ViatorItineraryItemDetail({
  id,
  title,
  description,
  imageUrl,
  price,
  duration,
  date,
  time,
  location,
  productUrl,
  productCode,
  labels = [],
  tripId,
  booking = { status: 'not_booked' },
  onUpdateBooking,
}: ViatorItineraryItemDetailProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleViewDetails = async () => {
    // Track the click
    await trackViatorLinkClick(productUrl, {
      tripId,
      productCode,
      pageContext: 'itinerary_item_detail',
    });

    // Open Viator product page in new tab
    window.open(productUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVoucherClick = async () => {
    if (!booking.voucherUrl) return;

    // Track the voucher access
    await trackViatorLinkClick(booking.voucherUrl, {
      tripId,
      productCode,
      pageContext: 'voucher_download',
    });

    // Open voucher in new tab
    window.open(booking.voucherUrl, '_blank', 'noopener,noreferrer');
  };

  // For demo purposes, simulate booking confirmation
  const handleSimulateBooking = () => {
    if (onUpdateBooking) {
      onUpdateBooking({
        status: 'confirmed',
        confirmationNumber: `VTR-${Math.floor(Math.random() * 10000000)}`,
        bookedAt: new Date().toISOString(),
        voucherUrl: `https://www.viator.com/voucher/${productCode}`,
      });
    }
  };

  return (
    <Card className="overflow-hidden border bg-surface-light dark:bg-surface-light/10">
      <div className="flex flex-col lg:flex-row">
        {/* Image section */}
        <div className="relative h-48 w-full lg:h-auto lg:w-1/3">
          <img src={imageUrl} alt={title} className="h-full w-full object-cover" />
          <div className="absolute right-2 top-2">
            <Badge
              variant="secondary"
              className="bg-white/90 text-xs font-medium shadow dark:bg-black/80"
            >
              Viator Experience
            </Badge>
          </div>
        </div>

        {/* Content section */}
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold">{title}</h3>

            <div className="mt-2 flex flex-wrap gap-2">
              {labels.map((label) => (
                <Badge
                  key={label}
                  variant="outline"
                  className="bg-accent-purple/5 text-xs dark:bg-accent-purple/10"
                >
                  {label}
                </Badge>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <MapPin size={16} />
                <span>{location}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-secondary-text">
                <Clock size={16} />
                <span>{duration}</span>
              </div>

              {date && (
                <div className="flex items-center gap-2 text-sm text-secondary-text">
                  <Calendar size={16} />
                  <span>
                    {date} {time && `at ${time}`}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 font-medium">
                <Ticket size={16} />
                <span>{price}</span>
              </div>
            </div>

            {isExpanded && <p className="mt-4 text-sm text-secondary-text">{description}</p>}
          </div>

          {/* Booking status section */}
          <div className="mt-auto">
            {booking.status === 'confirmed' ? (
              <div className="rounded-md bg-emerald-50 p-3 dark:bg-emerald-900/20">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  <Check size={16} />
                  <span>Booking Confirmed</span>
                </div>

                <div className="mt-2 flex flex-wrap gap-4 text-xs text-emerald-600 dark:text-emerald-300">
                  <div>
                    <span className="font-medium">Confirmation #:</span>{' '}
                    {booking.confirmationNumber}
                  </div>
                  {booking.bookedAt && (
                    <div>
                      <span className="font-medium">Booked:</span>{' '}
                      {new Date(booking.bookedAt).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  {booking.voucherUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={handleVoucherClick}
                    >
                      <FileText size={14} className="mr-1" />
                      View Voucher
                    </Button>
                  )}

                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs"
                    onClick={handleViewDetails}
                  >
                    Booking Details
                    <ExternalLink size={14} className="ml-1" />
                  </Button>
                </div>
              </div>
            ) : booking.status === 'pending' ? (
              <div className="rounded-md bg-amber-50 p-3 dark:bg-amber-900/20">
                <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                  <Clock size={16} />
                  <span>Booking Pending</span>
                </div>
                <p className="mt-1 text-xs text-amber-600 dark:text-amber-300">
                  Your booking is being processed. Please check your email for confirmation.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="default"
                        className="bg-accent-purple hover:bg-accent-purple/90"
                        onClick={handleSimulateBooking}
                      >
                        Book Now
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">You'll be redirected to Viator to complete booking</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button variant="outline" onClick={handleViewDetails}>
                  View Details
                  <ExternalLink size={16} className="ml-1" />
                </Button>

                <Button
                  variant="ghost"
                  className="ml-auto text-sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                >
                  {isExpanded ? 'Show Less' : 'Show More'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
