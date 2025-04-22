import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { MapPin, Clock, Users, ArrowRight, Star, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

// Sample itinerary data - in a real app, this would come from the database
const itineraries = [
  {
    id: "weekend-in-paris",
    title: "Weekend in Paris",
    description: "A perfect 3-day itinerary for first-time visitors to the City of Light",
    image: "/Parisian-Cafe-Scene.png",
    location: "Paris, France",
    duration: "3 days",
    groupSize: "2-4 people",
    category: "city",
    tags: ["romantic", "food", "culture"],
    rating: 4.8,
    reviewCount: 24,
    author: {
      name: "Sophie Martin",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "Iconic Paris",
        activities: [
          {
            time: "09:00",
            title: "Eiffel Tower",
            description: "Start your day with stunning views from Paris's most iconic landmark",
            location: "Champ de Mars, 5 Avenue Anatole France",
          },
          {
            time: "12:30",
            title: "Lunch at Café de Flore",
            description: "Enjoy a classic Parisian lunch at this historic café",
            location: "172 Boulevard Saint-Germain",
          },
          {
            time: "14:30",
            title: "Louvre Museum",
            description: "Explore one of the world's greatest art museums",
            location: "Rue de Rivoli",
          },
          {
            time: "19:00",
            title: "Seine River Cruise",
            description: "See Paris illuminated from the water on an evening cruise",
            location: "Pont de l'Alma",
          },
        ],
      },
      {
        day: 2,
        title: "Artistic Paris",
        activities: [
          {
            time: "10:00",
            title: "Montmartre & Sacré-Cœur",
            description: "Explore the artistic neighborhood and visit the beautiful basilica",
            location: "35 Rue du Chevalier de la Barre",
          },
          {
            time: "13:00",
            title: "Lunch at Le Consulat",
            description: "Dine at this quintessential Montmartre restaurant",
            location: "18 Rue Norvins",
          },
          {
            time: "15:00",
            title: "Musée d'Orsay",
            description: "Visit the impressive Impressionist collection in this former train station",
            location: "1 Rue de la Légion d'Honneur",
          },
          {
            time: "20:00",
            title: "Dinner in Le Marais",
            description: "Enjoy dinner in one of Paris's trendiest neighborhoods",
            location: "Le Marais district",
          },
        ],
      },
      {
        day: 3,
        title: "Royal Paris",
        activities: [
          {
            time: "09:30",
            title: "Palace of Versailles",
            description: "Take a day trip to the magnificent royal palace",
            location: "Place d'Armes, Versailles",
          },
          {
            time: "16:00",
            title: "Champs-Élysées & Arc de Triomphe",
            description: "Stroll down Paris's most famous avenue",
            location: "Champs-Élysées",
          },
          {
            time: "19:30",
            title: "Farewell dinner at Le Petit Prince",
            description: "Enjoy your last evening with classic French cuisine",
            location: "12 Rue de Lanneau",
          },
        ],
      },
    ],
  },
  {
    id: "tokyo-adventure",
    title: "Tokyo Adventure",
    description: "Explore the best of Tokyo in 5 days, from traditional temples to futuristic districts",
    image: "/tokyo-twilight.png",
    location: "Tokyo, Japan",
    duration: "5 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["food", "culture", "shopping"],
    rating: 4.9,
    reviewCount: 32,
    author: {
      name: "Kenji Tanaka",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "Traditional Tokyo",
        activities: [
          {
            time: "09:00",
            title: "Meiji Shrine",
            description: "Start with a peaceful visit to this beautiful Shinto shrine",
            location: "1-1 Yoyogikamizonocho, Shibuya City",
          },
          {
            time: "12:00",
            title: "Lunch at Tsukiji Outer Market",
            description: "Enjoy fresh seafood at the famous market area",
            location: "Tsukiji, Chuo City",
          },
          {
            time: "14:00",
            title: "Asakusa & Senso-ji Temple",
            description: "Visit Tokyo's oldest temple and shop on Nakamise Street",
            location: "2 Chome-3-1 Asakusa, Taito City",
          },
          {
            time: "18:00",
            title: "Dinner in Asakusa",
            description: "Try traditional Japanese cuisine in a local restaurant",
            location: "Asakusa area",
          },
        ],
      },
      {
        day: 2,
        title: "Modern Tokyo",
        activities: [
          {
            time: "10:00",
            title: "Shibuya Crossing & Hachiko Statue",
            description: "Experience the world's busiest pedestrian crossing",
            location: "Shibuya, Tokyo",
          },
          {
            time: "13:00",
            title: "Lunch at Shibuya Stream",
            description: "Modern dining in this new development",
            location: "3 Chome-21-3 Shibuya, Shibuya City",
          },
          {
            time: "15:00",
            title: "Harajuku & Takeshita Street",
            description: "Explore Japan's youth fashion center",
            location: "Takeshita Street, Harajuku",
          },
          {
            time: "19:00",
            title: "Dinner in Shinjuku",
            description: "Experience izakaya dining in this vibrant district",
            location: "Shinjuku, Tokyo",
          },
        ],
      },
    ],
  },
  {
    id: "barcelona-weekend",
    title: "Barcelona Weekend",
    description: "Beach, tapas, and architecture in this perfect weekend getaway",
    image: "/barceloneta-sand-and-sea.png",
    location: "Barcelona, Spain",
    duration: "3 days",
    groupSize: "4-8 people",
    category: "beach",
    tags: ["food", "nightlife", "architecture"],
    rating: 4.7,
    reviewCount: 19,
    author: {
      name: "Carlos Rodriguez",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "Gaudí's Barcelona",
        activities: [
          {
            time: "09:00",
            title: "Sagrada Familia",
            description: "Marvel at Gaudí's unfinished masterpiece",
            location: "Carrer de Mallorca, 401",
          },
          {
            time: "12:30",
            title: "Lunch at El Nacional",
            description: "Multi-space culinary experience in a historic building",
            location: "Passeig de Gràcia, 24 Bis",
          },
          {
            time: "14:30",
            title: "Park Güell",
            description: "Explore this colorful park with amazing city views",
            location: "Carrer d'Olot, 5",
          },
          {
            time: "19:00",
            title: "Tapas dinner in El Born",
            description: "Sample Spanish tapas in this trendy neighborhood",
            location: "El Born district",
          },
        ],
      },
    ],
  },
  {
    id: "california-road-trip",
    title: "California Road Trip",
    description: "The ultimate coastal drive from San Francisco to Los Angeles",
    image: "/california-highway-one.png",
    location: "California, USA",
    duration: "7 days",
    groupSize: "2-5 people",
    category: "road-trip",
    tags: ["nature", "driving", "beaches"],
    rating: 4.9,
    reviewCount: 28,
    author: {
      name: "Jessica Miller",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "San Francisco",
        activities: [
          {
            time: "09:00",
            title: "Golden Gate Bridge",
            description: "Walk or bike across this iconic landmark",
            location: "Golden Gate Bridge, San Francisco",
          },
          {
            time: "12:00",
            title: "Lunch at Fisherman's Wharf",
            description: "Enjoy seafood with views of the bay",
            location: "Fisherman's Wharf, San Francisco",
          },
        ],
      },
    ],
  },
  {
    id: "bangkok-explorer",
    title: "Bangkok Explorer",
    description: "Temples, markets, and street food in the vibrant Thai capital",
    image: "/bustling-bangkok-street.png",
    location: "Bangkok, Thailand",
    duration: "4 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["food", "culture", "budget"],
    rating: 4.6,
    reviewCount: 22,
    author: {
      name: "Supaporn Chai",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "Historic Bangkok",
        activities: [
          {
            time: "09:00",
            title: "Grand Palace & Wat Phra Kaew",
            description: "Visit the former royal residence and Temple of the Emerald Buddha",
            location: "Na Phra Lan Road, Bangkok",
          },
          {
            time: "12:30",
            title: "Lunch at Tha Tien Market",
            description: "Try authentic Thai street food near the river",
            location: "Tha Tien Market, Bangkok",
          },
          {
            time: "14:00",
            title: "Wat Pho",
            description: "See the famous Reclining Buddha and get a traditional Thai massage",
            location: "2 Sanamchai Road, Bangkok",
          },
          {
            time: "17:00",
            title: "Chao Phraya River Cruise",
            description: "Evening boat ride with dinner along Bangkok's main river",
            location: "Chao Phraya River, Bangkok",
          },
        ],
      },
      {
        day: 2,
        title: "Markets & Modern Bangkok",
        activities: [
          {
            time: "08:00",
            title: "Damnoen Saduak Floating Market",
            description: "Early morning trip to the famous floating market",
            location: "Damnoen Saduak, Ratchaburi Province",
          },
          {
            time: "13:00",
            title: "Lunch at Siam Paragon",
            description: "Explore the food court in this luxury mall",
            location: "Siam Paragon, Bangkok",
          },
          {
            time: "15:00",
            title: "Jim Thompson House",
            description: "Visit the beautiful teak house of the American silk entrepreneur",
            location: "6 Soi Kasemsan 2, Bangkok",
          },
          {
            time: "19:00",
            title: "Dinner and shopping at Asiatique",
            description: "Evening at the riverfront night market",
            location: "Asiatique The Riverfront, Bangkok",
          },
        ],
      },
      {
        day: 3,
        title: "Local Life",
        activities: [
          {
            time: "09:00",
            title: "Chatuchak Weekend Market",
            description: "Explore one of the world's largest weekend markets",
            location: "Chatuchak Park, Bangkok",
          },
          {
            time: "13:00",
            title: "Lunch at Or Tor Kor Market",
            description: "Premium fresh market with excellent food stalls",
            location: "Or Tor Kor Market, Bangkok",
          },
          {
            time: "15:00",
            title: "Lumpini Park",
            description: "Relax in Bangkok's central park and watch monitor lizards",
            location: "Lumpini Park, Bangkok",
          },
          {
            time: "18:00",
            title: "Dinner at Chinatown (Yaowarat)",
            description: "Experience the bustling food scene of Bangkok's Chinatown",
            location: "Yaowarat Road, Bangkok",
          },
        ],
      },
      {
        day: 4,
        title: "Cultural Immersion",
        activities: [
          {
            time: "09:00",
            title: "Thai Cooking Class",
            description: "Learn to make authentic Thai dishes",
            location: "Silom Thai Cooking School, Bangkok",
          },
          {
            time: "13:00",
            title: "Lunch at your cooking class",
            description: "Enjoy the fruits of your labor",
            location: "Silom Thai Cooking School, Bangkok",
          },
          {
            time: "15:00",
            title: "Bangkok Art and Culture Centre",
            description: "Explore contemporary Thai art and exhibitions",
            location: "939 Rama I Road, Bangkok",
          },
          {
            time: "19:00",
            title: "Farewell dinner at Thipsamai",
            description: "Try the famous Pad Thai at this legendary restaurant",
            location: "313-315 Maha Chai Road, Bangkok",
          },
        ],
      },
    ],
  },
  {
    id: "new-york-city-break",
    title: "New York City Break",
    description: "The essential NYC experience in just 4 days",
    image: "/manhattan-twilight.png",
    location: "New York, USA",
    duration: "4 days",
    groupSize: "2-6 people",
    category: "city",
    tags: ["shopping", "culture", "food"],
    rating: 4.8,
    reviewCount: 35,
    author: {
      name: "Michael Johnson",
      avatar: "/mystical-forest-spirit.png",
    },
    days: [
      {
        day: 1,
        title: "Midtown Manhattan",
        activities: [
          {
            time: "09:00",
            title: "Empire State Building",
            description: "Start with views from this iconic skyscraper",
            location: "20 W 34th St, New York",
          },
          {
            time: "12:00",
            title: "Lunch at Shake Shack",
            description: "Try this famous NY burger chain",
            location: "Madison Square Park, New York",
          },
        ],
      },
    ],
  },
]

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const itinerary = itineraries.find((i) => i.id === params.slug)

  if (!itinerary) {
    return {
      title: "Itinerary Not Found | withme.travel",
      description: "The requested itinerary template could not be found",
    }
  }

  return {
    title: `${itinerary.title} Itinerary | withme.travel`,
    description: itinerary.description,
  }
}

export default function ItineraryPage({ params }: { params: { slug: string } }) {
  // Find the itinerary with the matching slug
  const itinerary = itineraries.find((i) => i.id === params.slug)

  // If no matching itinerary is found, show the 404 page
  if (!itinerary) {
    console.error(`Itinerary with slug "${params.slug}" not found`)
    notFound()
  }

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: itinerary.title,
    description: itinerary.description,
    touristType: itinerary.tags,
    itinerary: {
      "@type": "ItemList",
      itemListElement: itinerary.days.map((day, index) => ({
        "@type": "ListItem",
        position: index + 1,
        item: {
          "@type": "TouristAttraction",
          name: day.title,
        },
      })),
    },
  }

  return (
    <>
      {/* Add structured data script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <div className="container py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <Link
                href="/itineraries"
                className="text-sm text-muted-foreground hover:text-primary flex items-center gap-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-arrow-left"
                >
                  <path d="m12 19-7-7 7-7" />
                  <path d="M19 12H5" />
                </svg>
                Back to all itineraries
              </Link>
            </div>

            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6">
              <Image
                src={itinerary.image || "/placeholder.svg?height=800&width=1200&query=travel destination"}
                alt={itinerary.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold">{itinerary.title}</h1>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button>Use This Template</Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{itinerary.location}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{itinerary.duration}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span>{itinerary.groupSize}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-amber-500" />
                <span>
                  {itinerary.rating} ({itinerary.reviewCount} reviews)
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-8">
              {itinerary.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="prose dark:prose-invert max-w-none mb-10">
              <p className="text-lg">{itinerary.description}</p>
              <p>
                This itinerary is perfect for travelers who want to experience the highlights of {itinerary.location} in{" "}
                {itinerary.duration}. It balances iconic landmarks, cultural experiences, and authentic local dining to
                give you a comprehensive taste of what makes this destination special.
              </p>
              <p>
                The schedule allows for flexibility and includes recommendations for dining at authentic local
                establishments. Feel free to adjust the pace based on your group's preferences and energy levels.
              </p>
            </div>

            <Tabs defaultValue="itinerary" className="mb-10">
              <TabsList className="mb-4">
                <TabsTrigger value="itinerary">Day-by-Day Itinerary</TabsTrigger>
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="tips">Travel Tips</TabsTrigger>
              </TabsList>

              <TabsContent value="itinerary" className="space-y-8">
                {itinerary.days.map((day) => (
                  <div key={day.day} className="border rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">
                      Day {day.day}: {day.title}
                    </h3>
                    <div className="space-y-6">
                      {day.activities.map((activity, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="w-16 flex-shrink-0 text-sm font-medium">{activity.time}</div>
                          <div>
                            <h4 className="font-medium">{activity.title}</h4>
                            <p className="text-sm text-muted-foreground mb-1">{activity.description}</p>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3 mr-1" />
                              {activity.location}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="map">
                <div className="border rounded-lg p-6 h-[500px] flex items-center justify-center bg-muted">
                  <p className="text-muted-foreground">Map view coming soon</p>
                </div>
              </TabsContent>

              <TabsContent value="tips">
                <div className="border rounded-lg p-6">
                  <h3 className="text-xl font-bold mb-4">Travel Tips for {itinerary.location}</h3>
                  <ul className="space-y-4">
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>
                        <strong>Best Time to Visit:</strong> Consider visiting during shoulder seasons to avoid crowds
                        while still enjoying good weather.
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>
                        <strong>Local Transportation:</strong> Public transportation is efficient and easy to use.
                        Consider getting a transit pass for unlimited travel.
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>
                        <strong>Popular Attractions:</strong> Book tickets for major attractions in advance to avoid
                        long lines and ensure availability.
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>
                        <strong>Dining:</strong> Try local specialties and be adventurous with your food choices. Ask
                        locals for recommendations away from tourist areas.
                      </p>
                    </li>
                    <li className="flex gap-2">
                      <div className="flex-shrink-0 mt-1">•</div>
                      <p>
                        <strong>Safety:</strong> While generally safe, be aware of your surroundings in crowded tourist
                        areas and keep valuables secure.
                      </p>
                    </li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle>Use This Template</CardTitle>
                  <CardDescription>Create your own trip based on this itinerary</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm">
                    Start planning your {itinerary.location} adventure with this template as your foundation. You can
                    customize every aspect to fit your group's preferences.
                  </p>
                  <Button className="w-full">
                    Create Trip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Created By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={itinerary.author.avatar || "/placeholder.svg"} alt={itinerary.author.name} />
                      <AvatarFallback>{itinerary.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{itinerary.author.name}</p>
                      <p className="text-sm text-muted-foreground">Travel Enthusiast</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Similar Itineraries</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {itineraries
                    .filter((i) => i.id !== itinerary.id && i.category === itinerary.category)
                    .slice(0, 2)
                    .map((similar) => (
                      <Link
                        href={`/itineraries/${similar.id}`}
                        key={similar.id}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                          <Image
                            src={similar.image || "/placeholder.svg"}
                            alt={similar.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-medium group-hover:text-primary transition-colors">{similar.title}</p>
                          <p className="text-sm text-muted-foreground">{similar.duration}</p>
                        </div>
                      </Link>
                    ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
