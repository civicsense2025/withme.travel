import type { Metadata } from "next"
import Link from "next/link"
import { Heart, Mail, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { PageHeader } from "@/components/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export const metadata: Metadata = {
  title: "support us | withme.travel",
  description: "Get help with your group travel planning or support our project",
}

// FAQ structured data for SEO
const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is withme.travel free to use?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes! Our core features are completely free. We may introduce premium features in the future, but the basic functionality will always remain free.",
      },
    },
    {
      "@type": "Question",
      name: "How do I invite friends to my trip?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Once you've created a trip, go to the members tab and use the invite button to send email invitations or generate a shareable link.",
      },
    },
    {
      "@type": "Question",
      name: "Can I export my itinerary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "You can export your trip itinerary to Google Calendar or download it as a PDF for offline reference.",
      },
    },
    {
      "@type": "Question",
      name: "What kind of trips is withme.travel best for?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "withme.travel works great for any group trip, but it's especially useful for weekend getaways, bachelor/bachelorette parties, family vacations, and friend reunions. Any trip where multiple people need to coordinate plans and make decisions together.",
      },
    },
    {
      "@type": "Question",
      name: "Can I use withme.travel for business trips?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "withme.travel works well for team retreats, conferences, and other business travel where multiple colleagues need to coordinate schedules and activities.",
      },
    },
    {
      "@type": "Question",
      name: "How do I report a bug?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "If you encounter any issues, please use our feedback form or email us directly at support@withme.travel.",
      },
    },
  ],
}

export default function SupportPage() {
  return (
    <>
      {/* Add structured data script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />

      <div className="container py-10">
        <PageHeader heading="support us" subheading="help us make group travel planning even better" />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card>
            <CardHeader>
              <Heart className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="lowercase">donate</CardTitle>
              <CardDescription className="lowercase">support our development</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                withme.travel is a passion project built by travelers for travelers. your donations help us keep the
                service running and add new features.
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full lowercase" asChild>
                <Link href="/donate">make a donation</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <MessageSquare className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="lowercase">feedback</CardTitle>
              <CardDescription className="lowercase">share your ideas</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                we're always looking to improve. tell us what features you'd love to see or how we can make your travel
                planning experience better.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full lowercase" asChild>
                <Link href="/feedback">send feedback</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <Mail className="h-8 w-8 text-primary mb-4" />
              <CardTitle className="lowercase">contact us</CardTitle>
              <CardDescription className="lowercase">get in touch</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                have questions or need help with something? our team is here to assist you with any issues or inquiries
                you might have.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full lowercase" asChild>
                <Link href="mailto:hello@withme.travel">email us</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center lowercase">frequently asked questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="free">
              <AccordionTrigger className="text-base font-medium">is withme.travel free to use?</AccordionTrigger>
              <AccordionContent>
                yes! our core features are completely free. we may introduce premium features in the future, but the
                basic functionality will always remain free.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="invite">
              <AccordionTrigger className="text-base font-medium">how do i invite friends to my trip?</AccordionTrigger>
              <AccordionContent>
                once you've created a trip, go to the members tab and use the invite button to send email invitations or
                generate a shareable link.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="export">
              <AccordionTrigger className="text-base font-medium">can i export my itinerary?</AccordionTrigger>
              <AccordionContent>
                absolutely! you can export your trip itinerary to google calendar or download it as a PDF for offline
                reference.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="best-for">
              <AccordionTrigger className="text-base font-medium">
                what kind of trips is withme.travel best for?
              </AccordionTrigger>
              <AccordionContent>
                <p>withme.travel works great for any group trip, but it's especially useful for:</p>
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>weekend getaways with friends</li>
                  <li>bachelor/bachelorette parties</li>
                  <li>family vacations</li>
                  <li>friend reunions</li>
                  <li>destination weddings</li>
                </ul>
                <p className="mt-2">
                  any trip where multiple people need to coordinate plans and make decisions together!
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business">
              <AccordionTrigger className="text-base font-medium">
                can i use withme.travel for business trips?
              </AccordionTrigger>
              <AccordionContent>
                absolutely! withme.travel works well for team retreats, conferences, and other business travel where
                multiple colleagues need to coordinate schedules and activities.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bug">
              <AccordionTrigger className="text-base font-medium">how do i report a bug?</AccordionTrigger>
              <AccordionContent>
                if you encounter any issues, please use our feedback form or email us directly at{" "}
                <a href="mailto:support@withme.travel" className="text-primary hover:underline">
                  support@withme.travel
                </a>
                .
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  )
}
