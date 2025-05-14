'use client';

import Link from 'next/link';
import { Heart, Mail, MessageSquare, Info, Instagram, Coffee, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';

const faqStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How can I suggest a new feature?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We love hearing your ideas! Drop us a note through the feedback form or email us directly. We read every suggestion and regularly update our roadmap based on user feedback.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do you handle user data and privacy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Your privacy matters to us. We use industry-standard security practices, and we'll never sell your data. Check out our privacy policy for the full details on how we protect your information.",
      },
    },
    {
      '@type': 'Question',
      name: 'Do you have a product roadmap we can see?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "While we don't publish our full roadmap, we regularly share updates about new features in our changelog and newsletter. Sign up for our newsletter to stay in the loop!",
      },
    },
    {
      '@type': 'Question',
      name: 'I found a bug - what should I do?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'First, thanks for catching it! Use our feedback form or email us with as much detail as you can about what happened. Screenshots are super helpful if you can include them.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I support withme.travel?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'There are lots of ways! Spread the word, send us feedback, report bugs, or consider making a donation. Every bit helps us keep improving and stay free for everyone.',
      },
    },
  ],
};

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [messageStatus, setMessageStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulated API call - replace with your actual submission logic
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessageStatus('success');
      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
      />

      <main className="min-h-screen bg-gradient-to-br from-background to-muted relative overflow-hidden font-sans">
        {/* Animated background shapes */}
        <div className="absolute inset-0 -z-10 pointer-events-none">
          <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-60 animate-float" />
          <div className="absolute bottom-[-100px] right-[-60px] w-96 h-96 bg-accent/20 rounded-full blur-3xl opacity-50 animate-float-slow" />
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-3 bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent tracking-tight">
              Support withme.travel
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Help us keep group travel planning free, ad-free, and delightful for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Story Column - Left Side */}
            <div className="md:col-span-7">
              <Card className="rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-0 overflow-hidden">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold mb-6">Our Story</h2>
                  <div className="prose prose-sm dark:prose-invert">
                    <p className="mb-4">
                      We started withme.travel because we lived the frustration—buried suggestions
                      in group chats, outdated spreadsheets no one could find, and the inevitable
                      "wait, who booked what again?" moments.
                    </p>
                    <p className="mb-4">
                      We asked ourselves: What if the planning was as enjoyable as the trip itself?
                      What if collecting ideas, making decisions, and keeping track of details
                      actually brought friends closer instead of testing everyone's patience?
                    </p>
                    <p className="mb-4">
                      That's why we're here: building a platform that's intuitive enough for
                      everyone to use but powerful enough to handle the beautiful complexity of
                      traveling together. No more lost details, missed recommendations, or planning
                      fatigue.
                    </p>

                    <div className="mt-6 p-5 rounded-xl bg-muted/30 border border-muted">
                      <p className="text-sm leading-relaxed">
                        <span className="font-medium">About transactions:</span> We don't process
                        financial transactions directly. We provide tools to track expenses, but
                        payments happen through your preferred payment methods.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Support Options - Right Side */}
            <div className="md:col-span-5 space-y-5">
              <Card className="rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-0 overflow-hidden">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4">
                    <Heart className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">Support Our Work</h3>
                  <p className="text-muted-foreground mb-6">
                    Help us build the travel planning experience you've always wanted. Your
                    contribution fuels new features and keeps our servers humming while we create
                    something special together.
                  </p>

                  <div className="flex flex-wrap gap-3 mb-6">
                    <a
                      href="https://venmo.com/u/ginandtanic"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto px-3 py-2 border-purple-400/50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-full"
                      >
                        Venmo
                      </Button>
                    </a>
                    <a
                      href="https://cash.app/$ginandtanic"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto px-3 py-2 border-purple-400/50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-full"
                      >
                        Cash App
                      </Button>
                    </a>
                    <a
                      href="https://www.paypal.com/paypalme/bktan6"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto px-3 py-2 border-purple-400/50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-full"
                      >
                        PayPal
                      </Button>
                    </a>
                    <a href="mailto:tanmho92@gmail.com?subject=withme.travel%20support%20%F0%9F%92%9C">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-auto px-3 py-2 border-purple-400/50 text-purple-600 hover:bg-purple-100 hover:text-purple-700 rounded-full flex items-center gap-1"
                      >
                        <Mail className="h-3.5 w-3.5" /> Zelle
                      </Button>
                    </a>
                  </div>

                  <button className="w-full py-3 flex items-center justify-center bg-purple-600 hover:bg-purple-700 text-white text-base font-medium rounded-full transition-colors shadow-md hover:shadow-lg">
                    <Coffee className="h-4 w-4 mr-2" />
                    <span>Buy us a coffee</span>
                  </button>

                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Can't donate? Share our story with fellow travelers who've experienced the
                      same planning headaches.
                    </p>
                    <a
                      href="https://instagram.com/ginandtanic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-sm text-purple-600 hover:text-purple-700 hover:underline"
                    >
                      <Instagram className="h-4 w-4 mr-1" />
                      Follow on Instagram
                    </a>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-3xl shadow-xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-0 overflow-hidden">
                <CardContent className="p-8">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>

                  <h3 className="text-xl font-bold mb-3">Share Your Feedback</h3>
                  <p className="text-muted-foreground mb-5">
                    Spotted a bug? Have a brilliant idea? Your insights directly influence what we
                    build. We're all ears—because the best travel platform comes from real travelers
                    like you.
                  </p>

                  <Button className="w-full py-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg">
                    Send Feedback <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
            <div className="max-w-3xl mx-auto bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-xl p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqStructuredData.mainEntity.map((item: any, index: number) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium py-4">
                      {item.name}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-4">
                      {item.acceptedAnswer.text}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto mt-16 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-3xl shadow-xl overflow-hidden">
            <div className="p-8">
              <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6">
                Still need help? We'll get back to you as quickly as possible.
              </p>

              {messageStatus === 'success' ? (
                <div className="flex flex-col items-center py-8">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <svg
                      className="h-8 w-8 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  <p className="text-center text-muted-foreground">
                    We've received your message and will get back to you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">
                        Your Name
                      </Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="mt-1 rounded-xl"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">
                        Your Email
                      </Label>
                      <Input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="mt-1 rounded-xl"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="subject" className="text-sm font-medium">
                      Subject
                    </Label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">
                      Your Message
                    </Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      required
                      className="mt-1 rounded-xl"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-6 rounded-full bg-primary hover:bg-primary/90 text-white text-base font-medium shadow-md hover:shadow-lg"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .animate-float {
          animation: float 8s ease-in-out infinite alternate;
        }
        .animate-float-slow {
          animation: float 14s ease-in-out infinite alternate;
        }
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
          }
          100% {
            transform: translateY(-20px) scale(1.04);
          }
        }
      `}</style>
    </>
  );
}
