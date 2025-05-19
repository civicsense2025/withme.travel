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
  title: 'Terms of Service | withme.travel',
  description: "Read the terms and conditions for using withme.travel's services.",
};

export default function TermsPage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-6">
        <Link href="/" legacyBehavior>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main content column */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-3">Terms of Service</h1>
          <p className="text-muted-foreground mb-6">Last updated: June 2024</p>

          <div
            className="prose dark:prose-invert max-w-none prose-sm sm:prose-base"
            id="terms-content"
          >
            <div className="bg-muted/50 p-6 rounded-lg mb-8">
              <p className="text-lg leading-relaxed">
                Welcome to withme.travel! These Terms of Service ("Terms") establish the rules and
                guidelines for using our platform. By accessing or using withme.travel, you agree to
                these Terms and our Privacy Policy. Please read them carefully.
              </p>
            </div>

            <section id="platform-usage" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">1. Platform Overview</h2>
              <h3 className="mt-6 mb-3">1.1 Description of Services</h3>
              <p>
                withme.travel is a collaborative group travel planning platform that helps you and
                your friends create, organize, and manage trips together. Our services include:
              </p>

              <div className="space-y-4 mt-4">
                <div>
                  <p className="font-semibold">
                    Collaborative Trip Planning and Itinerary Building:
                  </p>
                  <p>
                    Create, edit, and organize your travel plans together with friends in real-time
                  </p>
                </div>

                <div>
                  <p className="font-semibold">Group Creation and Management:</p>
                  <p>Form travel groups for ongoing planning, independent of specific trips</p>
                </div>

                <div>
                  <p className="font-semibold">Interactive Maps and Destination Content:</p>
                  <p>Access maps, location information, and curated activity suggestions</p>
                </div>

                <div>
                  <p className="font-semibold">Real-time Communication and Decision Tools:</p>
                  <p>Make group decisions efficiently with voting and feedback features</p>
                </div>

                <div>
                  <p className="font-semibold">Content Sharing and Export Capabilities:</p>
                  <p>Share plans and export itineraries to calendars and other formats</p>
                </div>
              </div>

              <h3 className="mt-6 mb-3">1.2 Service Updates and Modifications</h3>
              <p>
                We continuously improve our platform and may update, modify, or discontinue features
                at any time. We'll make reasonable efforts to notify you about significant changes
                that may affect your use of withme.travel.
              </p>
            </section>

            <section id="account-responsibilities" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">2. Your Account</h2>
              <h3 className="mt-6 mb-3">2.1 Account Creation and Security</h3>
              <p>You are responsible for:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Creating and maintaining the confidentiality of your account credentials</li>
                <li>
                  All activities that occur under your account, whether authorized by you or not
                </li>
                <li>
                  Providing accurate, current, and complete information when creating your account
                </li>
                <li>Promptly notifying us of any unauthorized access or security breaches</li>
              </ul>

              <h3 className="mt-6 mb-3">2.2 Account Restrictions</h3>
              <p>When creating and using your account, you agree not to:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Provide false or misleading information</li>
                <li>Create multiple accounts for deceptive or malicious purposes</li>
                <li>Share your account credentials with others</li>
                <li>Access the service after your account has been suspended or terminated</li>
              </ul>
            </section>

            <section id="user-content" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">3. Your Content</h2>
              <h3 className="mt-6 mb-3">3.1 Content Ownership</h3>
              <p>
                You retain all ownership rights to the content you create and upload to
                withme.travel, including trip plans, itineraries, comments, photos, and other
                materials ("User Content").
              </p>

              <h3 className="mt-6 mb-3">3.2 Content License</h3>
              <p>
                By posting User Content on withme.travel, you grant us a non-exclusive, worldwide,
                royalty-free license to use, copy, modify, display, and distribute your User Content
                as necessary to:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  Provide and operate our services (such as showing your trip plans to group
                  members)
                </li>
                <li>Improve and promote our platform (with your consent for public content)</li>
                <li>
                  Enable functionality like exporting to calendars or sharing with collaborators
                </li>
                <li>Store and back up your content to ensure availability</li>
              </ul>
              <p className="mt-3">
                This license exists only for the purposes of operating and improving withme.travel,
                and we will not use your content for other commercial purposes without your consent.
              </p>

              <h3 className="mt-6 mb-3">3.3 Content Restrictions</h3>
              <p>You agree not to post content that:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Violates any applicable law or regulation</li>
                <li>Infringes on intellectual property rights of others</li>
                <li>Contains malicious code, viruses, or harmful materials</li>
                <li>Is harassing, defamatory, obscene, or promotes discrimination</li>
                <li>Invades the privacy or violates the rights of others</li>
                <li>Misrepresents your identity or affiliation</li>
              </ul>
            </section>

            <section id="acceptable-use" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">4. Acceptable Use</h2>
              <h3 className="mt-6 mb-3">4.1 Prohibited Activities</h3>
              <p>When using withme.travel, you agree not to:</p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Use our services for any illegal purpose or in violation of any laws</li>
                <li>Harass, threaten, or harm other users</li>
                <li>Post spam, conduct phishing, or distribute malware</li>
                <li>
                  Impersonate others or misrepresent your affiliation with any person or entity
                </li>
                <li>Interfere with or disrupt our services or servers</li>
                <li>Attempt to gain unauthorized access to any part of our platform</li>
                <li>Use automated means to access or collect data without our permission</li>
                <li>Use our services to send unsolicited communications</li>
              </ul>

              <h3 className="mt-6 mb-3">4.2 Community Guidelines</h3>
              <p>
                At withme.travel, we're committed to creating a supportive and inclusive community
                where everyone feels welcome and respected. Our community guidelines are designed to
                help ensure all users can collaborate and plan trips in a positive environment.
              </p>

              <div className="mt-4 space-y-4 bg-muted/30 p-4 rounded-md">
                <div>
                  <p className="font-medium">Respect & Inclusion</p>
                  <p className="text-sm mt-1">
                    We have zero tolerance for discrimination, hate speech, harassment, or bullying
                    based on race, ethnicity, gender, sexual orientation, religion, disability, or
                    any other personal characteristic. Treat all community members with dignity and
                    respect, regardless of differences.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Constructive Communication</p>
                  <p className="text-sm mt-1">
                    Keep discussions friendly and constructive. Even during disagreements about
                    travel plans, maintain a respectful tone and focus on solutions rather than
                    criticisms. Consider how your words might be received by others.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Privacy & Consent</p>
                  <p className="text-sm mt-1">
                    Respect others' privacy by not sharing their personal information without
                    permission. This includes not posting someone else's contact details, exact
                    location, or sensitive personal information in trip plans or comments.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Appropriate Content</p>
                  <p className="text-sm mt-1">
                    Share content that's relevant to travel planning and appropriate for all
                    audiences. Avoid posting explicit, graphic, or offensive material that could
                    make others uncomfortable.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Collaborative Spirit</p>
                  <p className="text-sm mt-1">
                    Embrace the collaborative nature of group travel planning. Be open to others'
                    ideas and suggestions, and aim to make decisions that consider everyone's
                    preferences and needs.
                  </p>
                </div>

                <div>
                  <p className="font-medium">Reporting Violations</p>
                  <p className="text-sm mt-1">
                    If you encounter content or behavior that violates these guidelines, please
                    report it promptly. We're committed to addressing concerns quickly to maintain a
                    positive community.
                  </p>
                </div>
              </div>
              <p className="text-sm mt-3">
                Violation of these guidelines may result in content removal, temporary restrictions,
                or account termination in severe or repeated cases. We continually review and evolve
                these guidelines to ensure withme.travel remains a collaborative and supportive
                platform for all users.
              </p>
            </section>

            <section id="external-services" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">5. External Services & Integrations</h2>
              <h3 className="mt-6 mb-3">5.1 Third-Party Services</h3>
              <p>
                Our platform integrates with several third-party services to enhance functionality:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>
                  <strong>Mapping Services:</strong> Mapbox and Google Maps power our location and
                  mapping features
                </li>
                <li>
                  <strong>Activity Suggestions:</strong> Viator helps us provide activity and
                  experience options
                </li>
                <li>
                  <strong>Expense Tracking:</strong> We provide built-in expense tracking tools, but
                  users handle all payment processing on their own
                </li>
                <li>
                  <strong>Donations:</strong> Stripe processes optional donations to withme.travel
                </li>
                <li>
                  <strong>Platform Monitoring:</strong> Sentry helps with error tracking and
                  stability improvements
                </li>
              </ul>

              <h3 className="mt-6 mb-3">5.2 Data Sharing with External Services</h3>
              <p>
                When you use features powered by these services, some data may be shared with them
                as needed to provide functionality. For example, map services need location data to
                display relevant maps. We carefully select our partners and only share the minimum
                necessary information.
              </p>

              <h3 className="mt-6 mb-3">5.3 Third-Party Terms</h3>
              <p>
                Your use of these integrated services may also be subject to their own terms of
                service and privacy policies. We encourage you to review these third-party terms
                when using connected features.
              </p>
            </section>

            <section id="termination" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">6. Account Suspension and Termination</h2>
              <h3 className="mt-6 mb-3">6.1 Termination by withme.travel</h3>
              <p>
                We may suspend or terminate your access to withme.travel, without prior notice, if:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>You violate these Terms or other policies</li>
                <li>
                  We reasonably believe your actions may cause legal liability for you, other users,
                  or withme.travel
                </li>
                <li>
                  Your use poses a security risk or negatively impacts our platform or other users
                </li>
                <li>You engage in fraudulent or illegal activities</li>
              </ul>

              <h3 className="mt-6 mb-3">6.2 Termination by You</h3>
              <p>
                You may delete your account at any time through your account settings or by
                contacting our support team. Upon account deletion, we will process your data in
                accordance with our Privacy Policy and applicable data protection laws.
              </p>

              <h3 className="mt-6 mb-3">6.3 Effects of Termination</h3>
              <p>
                Upon termination, your right to access and use withme.travel will immediately cease.
                We may delete or archive your content according to our data retention policies.
                Provisions of these Terms that by their nature should survive termination will
                remain in effect.
              </p>
            </section>

            <section id="disclaimers" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">7. Disclaimers</h2>
              <h3 className="mt-6 mb-3">7.1 Service Availability</h3>
              <p>
                withme.travel is provided on an "as is" and "as available" basis. While we strive
                for reliability, we cannot guarantee that:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>The service will be available at all times without interruption</li>
                <li>The service will be error-free or completely secure</li>
                <li>Any information obtained through the service will be accurate or reliable</li>
                <li>Defects in the service will be corrected</li>
              </ul>

              <h3 className="mt-6 mb-3">7.2 Travel Planning Disclaimer</h3>
              <p>
                withme.travel helps you plan travel but is not a travel agency or provider. We do
                not guarantee the accuracy of destination information, availability of
                accommodations or activities, or the quality of services booked through or
                recommended by our platform.
              </p>

              <h3 className="mt-6 mb-3">7.3 Expense Tracking and Payments</h3>
              <p>
                While we provide tools to track expenses and split costs among group members,
                withme.travel does not process any payments directly between users. All payments
                between trip participants must be handled separately, and we are not responsible for
                any payment disputes between users.
              </p>

              <h3 className="mt-6 mb-3">7.4 User Interactions</h3>
              <p>
                We are not responsible for the conduct of other users, whether online or offline.
                You are solely responsible for your interactions with other users and should
                exercise caution and good judgment in these interactions.
              </p>
            </section>

            <section id="liability" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">8. Limitation of Liability</h2>
              <h3 className="mt-6 mb-3">8.1 Liability Exclusions</h3>
              <p>
                To the maximum extent permitted by applicable law, withme.travel and its officers,
                directors, employees, affiliates, and agents shall not be liable for:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Any indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                <li>
                  Damages resulting from interrupted service or inability to access the service
                </li>
                <li>Damages resulting from any content posted by users or third parties</li>
                <li>
                  Damages related to your reliance on information obtained through the service
                </li>
                <li>
                  Damages arising from or related to payments, financial transactions, or expense
                  tracking between users
                </li>
              </ul>

              <h3 className="mt-6 mb-3">8.2 Liability Cap</h3>
              <p>
                In jurisdictions where the exclusion or limitation of liability for consequential or
                incidental damages is not permitted, our liability is limited to the maximum extent
                permitted by law. In any case, our total liability shall not exceed the amount you
                paid us, if any, for using our services during the twelve (12) months preceding the
                claim.
              </p>

              <h3 className="mt-6 mb-3">8.3 Exceptions</h3>
              <p>
                Some jurisdictions do not allow the exclusion of certain warranties or the
                limitation or exclusion of liability for certain damages. Accordingly, some of the
                above limitations may not apply to you to the extent prohibited by applicable law.
              </p>
            </section>

            <section id="terms-changes" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">9. Changes to These Terms</h2>
              <p>
                We may modify these Terms from time to time to reflect changes in our services,
                legal requirements, or business practices. When we make changes, we will:
              </p>
              <ul className="mt-2 pl-6 list-disc space-y-1">
                <li>Post the updated Terms on this page with the "Last updated" date</li>
                <li>Provide notice of significant changes through the platform or via email</li>
                <li>
                  Allow you a reasonable time to review the changes before they take effect, when
                  appropriate
                </li>
              </ul>
              <p className="mt-3">
                Your continued use of withme.travel after the changes take effect constitutes your
                acceptance of the revised Terms. If you do not agree to the changes, you should stop
                using our services and close your account.
              </p>
            </section>

            <section id="governing-law" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">10. Governing Law</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the
                jurisdiction where withme.travel is legally established, without regard to its
                conflict of law provisions.
              </p>
              <p className="mt-3">
                If any provision of these Terms is found to be unenforceable or invalid, that
                provision will be limited or eliminated to the minimum extent necessary, and the
                remaining provisions will continue in full force and effect.
              </p>
            </section>

            <section id="contact-info" className="mt-10">
              <h2 className="scroll-mt-24 mb-4">11. Contact Us</h2>
              <p>
                If you have any questions, concerns, or feedback about these Terms, please contact
                our support team at:
              </p>
              <p className="mt-3">
                Email:{' '}
                <a
                  href="mailto:terms@withme.travel"
                  className="text-green-600 hover:underline dark:text-green-400"
                >
                  terms@withme.travel
                </a>
              </p>
              <p className="mt-3">
                We will make every reasonable effort to address your concerns promptly.
              </p>
            </section>

            <section id="terms-faq" className="mt-12 border-t pt-8">
              <h2 className="scroll-mt-24 mb-6">Terms of Service FAQ</h2>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger className="text-lg font-medium">
                    Who owns the content I create on withme.travel?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      You retain full ownership of all content you create on our platform. We only
                      use it to provide services to you and your trip collaborators, and to improve
                      the platform as explained in our Terms.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2">
                  <AccordionTrigger className="text-lg font-medium">
                    Does withme.travel sell my information to marketers?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      No. As stated in our Privacy Policy, we never sell or share your personal
                      information with advertisers or marketing companies. Your data is only used to
                      provide and improve our services.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3">
                  <AccordionTrigger className="text-lg font-medium">
                    What happens if I break the platform rules?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      If you violate our Terms of Service, we may take actions ranging from issuing
                      a warning to suspending or terminating your account, depending on the severity
                      and frequency of the violations. We generally try to provide notice when
                      possible, but may take immediate action in serious cases.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4">
                  <AccordionTrigger className="text-lg font-medium">
                    How do I delete my account and all my data?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      You can delete your account at any time through your account settings or by
                      contacting us at <a href="mailto:terms@withme.travel">terms@withme.travel</a>.
                      We'll process your deletion request in accordance with our Privacy Policy and
                      applicable law.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5">
                  <AccordionTrigger className="text-lg font-medium">
                    What third-party services does withme.travel use?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      We integrate with Mapbox and Google Maps for location features, Viator for
                      activity suggestions, and Sentry for platform reliability. For optional
                      donations, we use Stripe as a payment processor. We carefully select these
                      partners and only share the minimum data necessary for the services to
                      function.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6">
                  <AccordionTrigger className="text-lg font-medium">
                    Does withme.travel handle payments between users?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      No, withme.travel does not process payments between users. While we provide
                      expense tracking tools to help users track and split costs, all actual
                      payments must be handled separately between trip participants using their
                      preferred payment methods.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7">
                  <AccordionTrigger className="text-lg font-medium">
                    Can I use withme.travel for business purposes?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      Yes, you can use withme.travel to plan business trips and team retreats.
                      However, for commercial reselling of our services or large-scale
                      organizational use, please contact us to discuss enterprise options.
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8">
                  <AccordionTrigger className="text-lg font-medium">
                    What should I do if I find content that violates these Terms?
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>
                      If you encounter content that you believe violates our Terms of Service,
                      please report it to us at{' '}
                      <a href="mailto:terms@withme.travel">terms@withme.travel</a>. Include details
                      of the content and how it violates our Terms to help us respond appropriately.
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
                      href="#platform-usage"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      1. Platform Overview
                    </a>
                  </li>
                  <li>
                    <a
                      href="#account-responsibilities"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      2. Your Account
                    </a>
                  </li>
                  <li>
                    <a
                      href="#user-content"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      3. Your Content
                    </a>
                  </li>
                  <li>
                    <a
                      href="#acceptable-use"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      4. Acceptable Use
                    </a>
                  </li>
                  <li>
                    <a
                      href="#external-services"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      5. External Services & Integrations
                    </a>
                  </li>
                  <li>
                    <a
                      href="#termination"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      6. Account Suspension and Termination
                    </a>
                  </li>
                  <li>
                    <a
                      href="#disclaimers"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      7. Disclaimers
                    </a>
                  </li>
                  <li>
                    <a
                      href="#liability"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      8. Limitation of Liability
                    </a>
                  </li>
                  <li>
                    <a
                      href="#terms-changes"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      9. Changes to These Terms
                    </a>
                  </li>
                  <li>
                    <a
                      href="#governing-law"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      10. Governing Law
                    </a>
                  </li>
                  <li>
                    <a
                      href="#contact-info"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      11. Contact Us
                    </a>
                  </li>
                  <li>
                    <a
                      href="#terms-faq"
                      className="text-muted-foreground hover:text-foreground block py-0.5 transition"
                    >
                      Terms FAQ
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
