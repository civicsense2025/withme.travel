"use client"

import Link from "next/link"
import { Heart, Mail, MessageSquare, Info, Instagram } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

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
            {/* ... existing FAQ items ... */}
          </Accordion>
        </div>
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
