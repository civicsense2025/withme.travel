"use client"

import Link from "next/link"
import { Heart, Mail, MessageSquare, Info, Instagram } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useState } from 'react';

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I suggest a new feature?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "We love hearing your ideas! Drop us a note through the feedback form or email us directly. We read every suggestion and regularly update our roadmap based on user feedback.",
      },
    },
    {
      "@type": "Question",
      name: "How do you handle user data and privacy?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your privacy matters to us. We use industry-standard security practices, and we'll never sell your data. Check out our privacy policy for the full details on how we protect your information.",
      },
    },
    {
      "@type": "Question",
      name: "Do you have a product roadmap we can see?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "While we don't publish our full roadmap, we regularly share updates about new features in our changelog and newsletter. Sign up for our newsletter to stay in the loop!",
      },
    },
    {
      "@type": "Question",
      name: "I found a bug - what should I do?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "First, thanks for catching it! Use our feedback form or email us with as much detail as you can about what happened. Screenshots are super helpful if you can include them.",
      },
    },
    {
      "@type": "Question",
      name: "How can I support withme.travel?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "There are lots of ways! Spread the word, send us feedback, report bugs, or consider making a donation. Every bit helps us keep improving and stay free for everyone.",
      },
    },
  ],
}

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Simulated API call - replace with your actual submission logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessageStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setMessageStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
      
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl leading-loose font-bold mb-2">support us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            help keep withme.travel running and ad-free!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Story Column - Left Side */}
          <div className="md:col-span-8">
            <h2 className="text-2xl font-semibold mb-6">our story</h2>
            <div className="prose prose-sm dark:prose-invert">
              <p className="mb-6">
                Hey there! We're a small team of travelers who got tired of the endless
                WhatsApp threads and chaotic spreadsheets that seem to multiply every time
                we planned a trip with friends. You know the drill - someone loses track of
                the latest version, another person's email gets buried, and suddenly you're
                juggling ten different conversations about the same hotel booking.
              </p>
              <p className="mb-6">
                So we thought: what if planning a trip together could actually be... fun?
                Not just the dreaming-about-it part (though that's great too!), but the
                nitty-gritty details of figuring out where to stay, what to do, and how
                to split costs. We wanted to create something that feels less like project
                management and more like part of the adventure.
              </p>
              <p className="mb-6">
                That's how withme.travel was born - a passion project that grew from our
                own travel mishaps and "there has to be a better way" moments. We're
                building the tools we wish we had: simple enough that your not-so-tech-savvy
                friend can use it, but powerful enough to handle the complexity of group
                decisions and shared expenses.
              </p>

              <div className="mt-8 p-6 rounded-lg bg-muted/30 border border-muted">
                <p className="text-sm leading-relaxed">
                  <span className="font-medium">a note about money:</span> we believe in keeping things simple and secure. 
                  that's why we don't handle any financial transactions directly on withme.travel. while we offer 
                  Splitwise integration to help you track and settle expenses after your trip, it's completely optional. 
                  all actual money movements happen through your preferred payment methods outside our platform - we're 
                  just here to help you keep track of who owes what!
                </p>
              </div>
            </div>
          </div>

          {/* Support Options - Right Side */}
          <div className="md:col-span-4 space-y-4">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-travel-purple/60 via-travel-purple to-travel-purple/60 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-300 animate-gradient-xy"></div>
              <Card className="relative p-6 bg-card hover:bg-muted/50 transition-all duration-300">
                <div className="flex items-center gap-3 mb-3">
                  <Heart className="h-5 w-5 text-travel-purple" />
                  <h3 className="font-semibold">buy us a coffee</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  help keep our servers running and developers caffeinated! your support keeps group travel planning free for everyone.
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  <a href="https://venmo.com/u/ginandtanic" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-auto px-2.5 py-1 border-travel-purple/50 text-travel-purple hover:bg-travel-purple/30 hover:text-travel-purple-foreground"
                    >
                      venmo
                    </Button>
                  </a>
                  <a href="https://cash.app/$ginandtanic" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-auto px-2.5 py-1 border-travel-purple/50 text-travel-purple hover:bg-travel-purple/30 hover:text-travel-purple-foreground"
                    >
                      cash app
                    </Button>
                  </a>
                  <a href="https://www.paypal.com/paypalme/bktan6" target="_blank" rel="noopener noreferrer">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-auto px-2.5 py-1 border-travel-purple/50 text-travel-purple hover:bg-travel-purple/30 hover:text-travel-purple-foreground"
                    >
                      paypal
                    </Button>
                  </a>
                  <a href="mailto:tanmho92@gmail.com?subject=withme.travel%20support%20%F0%9F%92%9C">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-auto px-2.5 py-1 border-travel-purple/50 text-travel-purple hover:bg-travel-purple/30 hover:text-travel-purple-foreground flex items-center gap-1"
                    >
                      <Mail className="h-3.5 w-3.5" /> zelle
                    </Button>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  can't donate? no worries! sharing with friends or a follow helps too:
                </p>
                <a 
                  href="https://instagram.com/ginandtanic" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-sm text-travel-purple hover:underline"
                >
                  <Instagram className="h-4 w-4" />
                  follow on instagram →
                </a>
              </Card>
            </div>

            <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                <MessageSquare className="h-5 w-5 text-travel-purple" />
                <h3 className="font-semibold">share your thoughts</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Found a bug? Have an idea? We'd love to hear it! Your feedback shapes
                what we build next.
              </p>
              <a href="#" className="text-sm text-travel-purple hover:underline">send feedback →</a>
            </Card>

            <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:bg-muted/50">
              <div className="flex items-center gap-3 mb-3">
                <Mail className="h-5 w-5 text-travel-purple" />
                <h3 className="font-semibold">drop us a line</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Questions? Ideas? Just want to say hi? We're real humans who love
                chatting about travel!
              </p>
              <a href="#" className="text-sm text-travel-purple hover:underline">email us →</a>
            </Card>
          </div>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6 text-center">common questions</h2>
          
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I plan a trip?</AccordionTrigger>
              <AccordionContent>
                Planning a trip is easy! Use the "Create New Trip" button on your dashboard, 
                set your destination and dates, and start adding itinerary items like flights, 
                hotels, activities, and notes. You can use our search features to find 
                inspiration and places.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Can I collaborate with friends?</AccordionTrigger>
              <AccordionContent>
                Absolutely! WithMe Travel is designed for collaboration. You can
                invite friends to join your trip, and everyone can contribute to
                the itinerary, add suggestions, and manage expenses together in
                real-time.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>How does the budgeting feature work?</AccordionTrigger>
              <AccordionContent>
                You can set a target budget for your trip. As you add itinerary
                items with estimated costs, the app tracks your planned spending.
                You can also manually log expenses as they happen to compare actual
                spending against your plan.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Is my trip data private?</AccordionTrigger>
              <AccordionContent>
                By default, trips are private to you and the members you invite.
                You can choose to share a trip publicly via a unique link if you
                want. Check our{' '}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>{' '}
                for more details.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>What if I encounter an issue?</AccordionTrigger>
              <AccordionContent>
                If you run into any problems or have questions not covered here,
                please reach out to our support team via the contact form below or
                email us directly at{' '}
                <a
                  href="mailto:support@withme.travel"
                  className="text-primary hover:underline"
                >support@withme.travel
                </a>.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-6">
              <AccordionTrigger>Can I use WithMe Travel offline?</AccordionTrigger>
              <AccordionContent>
                Currently, WithMe Travel requires an internet connection for most
                features, including real-time collaboration and searching for new
                destinations.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-7">
              <AccordionTrigger>Do you offer pre-made itineraries?</AccordionTrigger>
              <AccordionContent>
                Yes! We have a growing library of itinerary templates created by
                other travelers and our team. You can browse these templates,
                customize them, and use them as a starting point for your trip.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-8">
              <AccordionTrigger>How are destinations suggested?</AccordionTrigger>
              <AccordionContent>
                We use a combination of factors including popular travel trends,
                user interests (if you've shared them during onboarding), and
                location data to suggest destinations.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <section>
          <h2 className="text-2xl font-bold mb-4">Contact Support</h2>
          <p className="text-muted-foreground mb-6">
            Still need help? Fill out the form below, and we'll get back to you
            as soon as possible.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <Input 
                  type="text" 
                  id="name" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div>
                <Label htmlFor="email">Your Email</Label>
                <Input 
                  type="email" 
                  id="email" 
                  name="email" 
                  value={formData.email}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input 
                type="text" 
                id="subject" 
                name="subject" 
                value={formData.subject}
                onChange={handleChange}
                required 
              />
            </div>
            <div>
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </Button>
            {messageStatus && (
              <p
                className={`text-sm mt-2 ${messageStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}
              >
                {messageStatus === 'success' ? 'Message sent successfully! We will get back to you soon.' : messageStatus}
              </p>
            )}
          </form>
        </section>

        <section className="text-center text-sm text-muted-foreground mt-12">
          <p>
            For urgent issues, you can also reach us at{' '}
            <a
              href="mailto:support@withme.travel"
              className="text-primary hover:underline"
            >support@withme.travel
            </a>
          </p>
          <p>We typically respond within 24-48 hours during business days.</p>
        </section>
      </div>
    </>
  )
}

// Add this to your globals.css or a new styles file
/*
@keyframes gradient-xy {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.animate-gradient-xy {
  animation: gradient-xy 15s ease infinite;
  background-size: 200% 200%;
}
*/
