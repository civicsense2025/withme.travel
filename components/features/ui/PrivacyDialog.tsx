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

export function PrivacyDialog({
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
          <DialogTitle className="text-xl font-bold">Privacy Policy</DialogTitle>
          <DialogDescription>Last updated: May 2025</DialogDescription>
        </DialogHeader>

        <div className="prose dark:prose-invert max-w-none prose-sm py-4 pr-2">
          <div className="bg-muted/50 p-4 rounded-lg mb-6">
            <p className="leading-relaxed text-sm">
              At withme.travel, your privacy is our top priority. This Privacy Policy explains in
              clear language how we collect, use, and protect your information when you use our
              platform. <strong>We never sell your data to marketers or advertisers</strong>, and
              we're committed to transparency about how your information is handled.
            </p>
          </div>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">1. Information We Collect</h3>
            <p className="text-sm mb-3">
              We collect information you provide directly when you create an account, plan trips,
              send messages, respond to surveys, or subscribe to newsletters. This may include:
            </p>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>
                <strong>Account Information:</strong> Your name, email address, profile picture
              </li>
              <li>
                <strong>Travel Content:</strong> Trip details, itineraries, group plans, comments
              </li>
              <li>
                <strong>Communications:</strong> Messages and interactions with other users
              </li>
              <li>
                <strong>Device Information:</strong> IP address, browser type, operating system
              </li>
              <li>
                <strong>Usage Data:</strong> How you interact with our services
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">2. How We Use Your Information</h3>
            <p className="text-sm mb-3">
              We use your information to provide and improve our services, personalize your
              experience, analyze usage patterns, facilitate communication between trip members,
              send service announcements, respond to support requests, detect security issues, and
              ensure proper functioning of our services.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">3. External Services & APIs</h3>
            <p className="text-sm mb-3">
              We partner with trusted third-party services to enhance your experience:
            </p>
            <ul className="text-sm pl-5 list-disc space-y-1">
              <li>
                <strong>Mapbox & Google Maps:</strong> For interactive maps and location features
              </li>
              <li>
                <strong>Viator:</strong> For activity and experience suggestions
              </li>
              <li>
                <strong>Stripe:</strong> For optional donations (payment information handled by
                Stripe)
              </li>
              <li>
                <strong>Sentry:</strong> For error monitoring and platform reliability
              </li>
            </ul>
            <p className="text-sm mt-2">
              We carefully select our service providers and only share the minimum data necessary
              for these services to function. Your personal information is never shared for
              marketing or advertising purposes.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">4. How We Share Your Information</h3>
            <p className="text-sm mb-2">
              We <strong>never</strong> sell your personal information to third parties for
              marketing purposes. We only share your information in the following limited
              circumstances:
            </p>
            <ul className="text-sm pl-5 list-disc space-y-1">
              <li>
                <strong>Trip Collaborators:</strong> Information you add to trips is shared with
                people you invite
              </li>
              <li>
                <strong>Service Providers:</strong> With trusted providers who help deliver our
                services
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by applicable law or governmental
                request
              </li>
              <li>
                <strong>Business Transfers:</strong> In connection with a merger or acquisition,
                with confidentiality protections
              </li>
            </ul>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">5. Your Rights & Choices</h3>
            <p className="text-sm mb-3">
              Depending on your location, you may have the right to access, correct, delete,
              restrict processing of, and port your personal data. You can update your profile
              information through account settings, opt in/out of marketing communications, and
              export your trip data.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">6. Security</h3>
            <p className="text-sm mb-3">
              We implement appropriate technical and organizational measures to protect your
              personal information, including encryption, secure hosting, regular security
              assessments, and access controls. We regularly review and update our security
              practices.
            </p>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-medium mb-2">Privacy FAQ</h3>
            <ul className="text-sm pl-5 list-disc space-y-1 mb-3">
              <li>
                <strong>Do you sell my data?</strong> No, we never sell or rent your personal
                information to advertisers or data brokers.
              </li>
              <li>
                <strong>What external services do you use?</strong> Mapbox, Google Maps, Viator,
                Stripe, and Sentry for platform features and reliability.
              </li>
              <li>
                <strong>How can I delete my account?</strong> Request deletion through account
                settings or by contacting us at{' '}
                <a href="mailto:privacy@withme.travel">privacy@withme.travel</a>.
              </li>
              <li>
                <strong>How do you protect my data?</strong> We use encryption, access controls, and
                regular security assessments.
              </li>
              <li>
                <strong>How can I contact you?</strong> Email{' '}
                <a href="mailto:privacy@withme.travel">privacy@withme.travel</a> for any privacy
                concerns.
              </li>
            </ul>
          </section>

          <div className="mt-8 flex justify-end">
            <Button asChild variant="outline">
              <Link href="/privacy">Read full Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
