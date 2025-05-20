import Link from 'next/link';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/page-header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export const metadata = {
  title: 'Privacy Policy | withme.travel',
  description: 'Learn how withme.travel collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content column */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3">Privacy Policy</h1>
          <p className="text-muted-foreground mb-6">Last updated: June 2024</p>

          <div
            className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
            id="privacy-content"
          >
            <div className="bg-muted/50 p-6 rounded-lg mb-8">
              <p className="text-lg leading-relaxed">
                At withme.travel, your privacy is our top priority. This Privacy Policy explains in
                clear language how we collect, use, and protect your information when you use our
                platform. <strong>We never sell your data to marketers or advertisers</strong>, and
                we're committed to transparency about how your information is handled.
              </p>
            </div>

            <section id="information-collected" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">1. Information We Collect</h2>
              <h3 className="mt-6 mb-3">1.1 Information You Provide to Us</h3>
              <p>We collect information you provide directly to us when you:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Create an account or update your profile information</li>
                <li>Plan trips, join groups, or create/edit activities</li>
                <li>Send messages, post comments, or share reactions</li>
                <li>Respond to surveys or contact our support team</li>
                <li>Subscribe to newsletters or promotional communications</li>
              </ul>

              <h3 className="mt-6 mb-3">1.2 Types of Data We Collect</h3>
              <p>Depending on how you interact with withme.travel, we may collect:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Account Information:</strong> Your name, email address, profile picture,
                  and account preferences
                </li>
                <li>
                  <strong>Travel Content:</strong> Trip details, itineraries, group plans, comments,
                  and any other content you create or upload
                </li>
                <li>
                  <strong>Communications:</strong> Messages, comments, and interactions with other
                  users within our platform
                </li>
                <li>
                  <strong>Expense Information:</strong> When you use our expense tracking tools, we
                  store the expense data you enter (but we do not process any payments directly)
                </li>
                <li>
                  <strong>Device Information:</strong> IP address, browser type, operating system,
                  and other technical information about the device you use to access withme.travel
                </li>
                <li>
                  <strong>Usage Data:</strong> How you interact with our services, including pages
                  visited, features used, and actions taken
                </li>
              </ul>
            </section>

            <section id="how-we-use" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">2. How We Use Your Information</h2>
              <p>We use your information for the following purposes:</p>

              <h3 className="mt-6 mb-3">2.1 Providing and Improving Our Services</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  Delivering the core functionality of our collaborative travel planning platform
                </li>
                <li>Personalizing your experience based on your preferences and activity</li>
                <li>Developing new features and enhancing existing ones</li>
                <li>Analyzing usage patterns to improve user experience</li>
              </ul>

              <h3 className="mt-6 mb-3">2.2 Communication and Support</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Facilitating communication between trip members</li>
                <li>Sending service announcements, updates, and security alerts</li>
                <li>Responding to your questions and support requests</li>
                <li>Sending optional newsletters or promotional content (with your consent)</li>
              </ul>

              <h3 className="mt-6 mb-3">2.3 Platform Security and Integrity</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Detecting and preventing fraudulent activity and security incidents</li>
                <li>Monitoring for technical issues and resolving them quickly</li>
                <li>Ensuring the proper functioning and reliability of our services</li>
                <li>Verifying accounts and activity as needed for security purposes</li>
              </ul>
            </section>

            <section id="external-services" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">3. External Services & APIs</h2>
              <p>
                We partner with trusted third-party services to enhance your experience on
                withme.travel. Here's how we work with them:
              </p>

              <h3 className="mt-6 mb-3">3.1 Mapping and Location Services</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Mapbox & Google Maps:</strong> We use these services to provide
                  interactive maps, place search, and location features. When you use map-related
                  features, these services may process your device location data and search queries
                  to display relevant information.
                </li>
              </ul>

              <h3 className="mt-6 mb-3">3.2 Activity and Booking Services</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Viator:</strong> To offer activity and experience suggestions, we partner
                  with Viator. When you search for or book activities, limited data may be shared to
                  display relevant options and process bookings.
                </li>
              </ul>

              <h3 className="mt-6 mb-3">3.3 Payment and Donations</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Expense Tracking:</strong> Our built-in expense tracking tools allow you
                  to track trip costs, but we do not process payments directly.
                </li>
                <li>
                  <strong>Stripe:</strong> For optional donations to withme.travel, we use Stripe as
                  a payment processor. When making donations, your payment information is handled
                  directly by Stripe according to their privacy policy and security standards.
                </li>
              </ul>

              <h3 className="mt-6 mb-3">3.4 Platform Reliability</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Sentry:</strong> We use Sentry for error monitoring and platform
                  reliability. If something goes wrong, Sentry may collect technical information
                  about the error to help us fix the issue quickly.
                </li>
              </ul>

              <p className="font-medium mt-4">
                Important: We carefully select our service providers and only share the minimum data
                necessary for these services to function. Your personal information is never shared
                for marketing or advertising purposes.
              </p>
            </section>

            <section id="cookies-technologies" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">4. Cookies and Similar Technologies</h2>
              <h3 className="mt-6 mb-3">4.1 How We Use Cookies</h3>
              <p>Cookies and similar technologies help us deliver a better user experience:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Essential Cookies:</strong> Required for basic platform functionality,
                  such as keeping you logged in and remembering your preferences
                </li>
                <li>
                  <strong>Analytics Cookies:</strong> Help us understand how visitors use our site,
                  allowing us to improve design and features
                </li>
                <li>
                  <strong>Functional Cookies:</strong> Enable enhanced functionality and
                  personalization
                </li>
              </ul>

              <h3 className="mt-6 mb-3">4.2 Your Cookie Choices</h3>
              <p>
                You can manage cookie preferences through your browser settings. However, disabling
                certain cookies may limit functionality or prevent some features from working
                properly.
              </p>

              <h3 className="mt-6 mb-3">4.3 Offline Access</h3>
              <p>
                Our platform supports offline access and Progressive Web App (PWA) features, which
                may store some data locally on your device for convenience when you have limited or
                no internet connectivity.
              </p>
            </section>

            <section id="information-sharing" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">5. How We Share Your Information</h2>
              <p className="font-medium">
                We <strong>never</strong> sell your personal information to third parties for
                marketing purposes. We only share your information in the following limited
                circumstances:
              </p>

              <h3 className="mt-6 mb-3">5.1 Shared With Your Permission</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Trip Collaborators:</strong> Information you add to trips and group plans
                  is shared with the people you invite to collaborate
                </li>
                <li>
                  <strong>Public Content:</strong> Any content you choose to make public may be
                  visible to other users
                </li>
                <li>
                  <strong>Integrated Services:</strong> When you explicitly connect third-party
                  services (such as exporting to Google Calendar)
                </li>
              </ul>

              <h3 className="mt-6 mb-3">5.2 Service Providers</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  With trusted service providers who help us deliver our services (under strict
                  confidentiality and data protection agreements)
                </li>
                <li>
                  These providers are only permitted to use your information to provide services to
                  us, not for their own purposes
                </li>
              </ul>

              <h3 className="mt-6 mb-3">5.3 Legal Requirements</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  When required by applicable law, regulation, legal process, or governmental
                  request
                </li>
                <li>
                  To protect the rights, property, or safety of withme.travel, our users, or the
                  public
                </li>
              </ul>

              <h3 className="mt-6 mb-3">5.4 Business Transfers</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  In connection with a merger, acquisition, or sale of assets, with appropriate
                  confidentiality protections
                </li>
              </ul>
            </section>

            <section id="rights-choices" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">6. Your Rights & Choices</h2>
              <p>
                We respect your control over your personal information. Depending on your location,
                you may have specific legal rights regarding your data:
              </p>

              <h3 className="mt-6 mb-3">6.1 Access and Control</h3>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Account Settings:</strong> Access and update your profile information at
                  any time through your account settings
                </li>
                <li>
                  <strong>Communication Preferences:</strong> Opt in or out of marketing
                  communications
                </li>
                <li>
                  <strong>Data Export:</strong> Export your trip data to PDF, calendar apps, and
                  other formats
                </li>
              </ul>

              <h3 className="mt-6 mb-3">6.2 Legal Rights (varies by region)</h3>
              <p>Depending on your location, you may have the right to:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Access the personal data we hold about you</li>
                <li>Correct inaccurate or incomplete data</li>
                <li>Request deletion of your personal data</li>
                <li>Restrict or object to certain processing of your data</li>
                <li>
                  Data portability (receiving your data in a structured, commonly used format)
                </li>
              </ul>

              <h3 className="mt-6 mb-3">6.3 How to Exercise Your Rights</h3>
              <p>
                You can exercise many of these rights directly through your account settings. For
                additional assistance or to exercise rights not available through settings, please
                contact us at{' '}
                <a
                  href="mailto:privacy@withme.travel"
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  privacy@withme.travel
                </a>
                .
              </p>
            </section>

            <section id="data-security" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">7. Data Security</h2>
              <p>
                Protecting your information is fundamental to our service. We implement robust
                security measures to safeguard your personal data:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Encryption:</strong> We use industry-standard encryption protocols to
                  protect data in transit and at rest
                </li>
                <li>
                  <strong>Access Controls:</strong> We restrict access to personal information to
                  authorized employees and contractors who need it to perform their job functions
                </li>
                <li>
                  <strong>Regular Audits:</strong> We conduct regular security assessments and
                  continuously monitor our systems for potential vulnerabilities
                </li>
                <li>
                  <strong>Incident Response:</strong> We have established procedures to address any
                  suspected personal data breach
                </li>
              </ul>
              <p className="mt-4">
                While we implement these safeguards, absolute security cannot be guaranteed in any
                online environment. We work diligently to use commercially acceptable means to
                protect your personal information, maintain accuracy, and ensure appropriate use of
                information.
              </p>
            </section>

            <section id="international-transfers" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">8. International Data Transfers</h2>
              <p>
                withme.travel operates globally, which means your information may be transferred to,
                stored, and processed in countries outside of your residence, including the United
                States and European Union.
              </p>
              <p className="mt-3">
                When we transfer data internationally, we implement appropriate safeguards to ensure
                your information receives an adequate level of protection, such as:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Using EU-approved Standard Contractual Clauses</li>
                <li>Ensuring service providers adhere to comprehensive privacy frameworks</li>
                <li>Implementing technical and organizational measures to protect data</li>
              </ul>
              <p className="mt-3">
                By using our services, you consent to the transfer of information to countries that
                may have different data protection rules than your country.
              </p>
            </section>

            <section id="childrens-privacy" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">9. Children's Privacy</h2>
              <p>
                withme.travel is designed for adult users and is not directed at children under the
                age of 13 (or the applicable age in your jurisdiction).
              </p>
              <p className="mt-3">
                We do not knowingly collect personal information from children. If we discover that
                we have collected personal information from a child without parental consent where
                required, we will promptly delete that information. If you believe we might have
                information from or about a child, please contact us at{' '}
                <a
                  href="mailto:privacy@withme.travel"
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  privacy@withme.travel
                </a>
                .
              </p>
            </section>

            <section id="policy-changes" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices,
                services, or applicable laws. We will post the revised policy on this page with an
                updated "Last updated" date.
              </p>
              <p className="mt-3">
                For significant changes, we will provide a more prominent notice, which may include
                email notification to affected users. We encourage you to review the Privacy Policy
                whenever you access our services.
              </p>
              <p className="mt-3">
                Your continued use of withme.travel after changes to the Privacy Policy constitutes
                your acceptance of the revised terms.
              </p>
            </section>

            <section id="contact-us" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">11. Contact Us</h2>
              <p>
                If you have questions, concerns, or requests regarding this Privacy Policy or our
                data practices, please contact our Privacy Team at:
              </p>
              <p className="mt-3">
                Email:{' '}
                <a
                  href="mailto:privacy@withme.travel"
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  privacy@withme.travel
                </a>
              </p>
              <p className="mt-3">
                We are committed to working with you to obtain a fair resolution of any complaint or
                concern about privacy.
              </p>
            </section>

            <section id="privacy-faq" className="mt-12 border-t pt-8">
              <h2 className="scroll-mt-24 mb-6">Privacy FAQ</h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    Do you sell my data to advertisers or data brokers?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      No. We never sell or rent your personal information to advertisers, data
                      brokers, or other third parties. Your data is used solely to provide and
                      improve our services, and as otherwise described in this Privacy Policy.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium">
                    What external services do you use and why?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We use Mapbox and Google Maps for location features, Viator for activity
                      suggestions, Stripe for processing optional donations, and Sentry for error
                      monitoring. These services help us provide essential functionality while
                      maintaining platform reliability and security. We only share the minimum data
                      necessary for these services to function.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium">
                    How can I delete my account and all my data?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      You can request account deletion through your account settings or by
                      contacting our support team at{' '}
                      <a href="mailto:privacy@withme.travel">privacy@withme.travel</a>. Upon
                      verification, we will delete your account and personal information in
                      accordance with applicable law and our data retention policies.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium">
                    How do you protect my personal information?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We use industry-standard encryption, access controls, regular security
                      assessments, and strict internal practices. We limit data access to authorized
                      personnel, implement technical safeguards, and continuously monitor our
                      systems to protect your information.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium">
                    Do you track my location?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We only access location information when you explicitly use map features or
                      choose to share your location for trip planning purposes. You can control
                      location permissions through your device or browser settings at any time.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-lg font-medium">
                    What happens to my data if I'm inactive for a long time?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      If your account is inactive for an extended period (typically over 24 months),
                      we may archive or delete certain data in accordance with our retention
                      policies. You'll receive notification before any significant action is taken
                      on long-inactive accounts.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-lg font-medium">
                    How do you respond to legal requests for my data?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We carefully review all legal requests to ensure they comply with applicable
                      law. We will only provide information in response to requests that have a
                      valid legal basis, and we will notify affected users when permitted by law.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-lg font-medium">
                    How can I contact you about privacy concerns?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Email our dedicated privacy team any time at{' '}
                      <a href="mailto:privacy@withme.travel">privacy@withme.travel</a>. We're
                      committed to addressing your concerns promptly and transparently.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </section>
          </div>
        </div>

        {/* Table of Contents column */}
        <div className="lg:w-56">
          <div className="sticky top-24 overflow-auto max-h-[calc(100vh-8rem)]">
            <div className="bg-card p-4 rounded-lg shadow-sm">
              <h3 className="text-base font-semibold mb-3">Contents</h3>
              <nav className="text-xs">
                <ul className="space-y-1">
                  <li>
                    <a
                      href="#information-collected"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      1. Information We Collect
                    </a>
                  </li>
                  <li>
                    <a
                      href="#how-we-use"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      2. How We Use Your Information
                    </a>
                  </li>
                  <li>
                    <a
                      href="#external-services"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      3. External Services & APIs
                    </a>
                  </li>
                  <li>
                    <a
                      href="#cookies-technologies"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      4. Cookies and Similar Technologies
                    </a>
                  </li>
                  <li>
                    <a
                      href="#information-sharing"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      5. How We Share Your Information
                    </a>
                  </li>
                  <li>
                    <a
                      href="#rights-choices"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      6. Your Rights & Choices
                    </a>
                  </li>
                  <li>
                    <a
                      href="#data-security"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      7. Data Security
                    </a>
                  </li>
                  <li>
                    <a
                      href="#international-transfers"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      8. International Data Transfers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#childrens-privacy"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      9. Children's Privacy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#policy-changes"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      10. Changes to This Policy
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact-us"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      11. Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#privacy-faq"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      Privacy FAQ
                    </a>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
