import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from '@/components/ui/dialog';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Terms of Service</DialogTitle>
          <DialogDescription>Last updated: May 2025</DialogDescription>
        </DialogHeader>

        <div className="prose dark:prose-invert max-w-none prose-sm py-4 pr-2">
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <p className="leading-relaxed text-sm">
              Welcome to withme.travel! These Terms of Service ("Terms") establish the rules and
              guidelines for using our platform. By accessing or using withme.travel, you agree to
              these Terms and our Privacy Policy. Please read them carefully.
            </p>
          </div>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">1. Platform Overview</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>Collaborative trip planning and itinerary building</li>
              <li>Group creation and management</li>
              <li>Interactive maps and destination content</li>
              <li>Real-time communication and decision tools</li>
              <li>Content sharing and export capabilities</li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">2. Your Account</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>Keep your credentials confidential and accurate</li>
              <li>Don't create multiple or deceptive accounts</li>
              <li>Notify us of unauthorized access</li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">3. Your Content</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>You retain ownership of your content</li>
              <li>We use your content only to provide and improve our services</li>
              <li>Don't post illegal, harmful, or infringing content</li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">4. Acceptable Use</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>No illegal, harassing, or disruptive behavior</li>
              <li>Respect others and follow our community guidelines</li>
              <li>No spamming, impersonation, or unauthorized access</li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">5. External Services & Integrations</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>We use Mapbox, Google Maps, Viator, Stripe, and Sentry for platform features</li>
              <li>Some data may be shared with these services as needed</li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">Terms FAQ</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>
                <strong>Who owns my content?</strong> You do. We only use it to provide and improve
                our services.
              </li>
              <li>
                <strong>Do you sell my information?</strong> No, we never sell or share your
                personal info with marketers.
              </li>
              <li>
                <strong>What happens if I break the rules?</strong> We may warn, restrict, or
                suspend your account depending on the severity.
              </li>
              <li>
                <strong>How do I delete my account?</strong> Use account settings or email{' '}
                <a href="mailto:terms@withme.travel">terms@withme.travel</a>.
              </li>
              <li>
                <strong>What third-party services do you use?</strong> Mapbox, Google Maps, Viator,
                Sentry, and Stripe for donations.
              </li>
              <li>
                <strong>Does withme.travel handle payments?</strong> No, we only provide expense
                tracking tools. Payments are handled separately by users.
              </li>
            </ul>
          </section>

          <div className="mt-8 flex justify-end">
            <Button asChild variant="outline">
              <Link href="/terms">Read full Terms of Service</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
