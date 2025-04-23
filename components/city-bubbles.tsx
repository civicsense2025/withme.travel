"use client"
import { useEffect, useState, useRef } from "react"
import { motion, useInView, MotionValue } from "framer-motion"
import Link from "next/link"

type CityBubble = {
  id: number
  text: string
  citySlug: string
  color: string
  sizeClass: string
  x: string
  y: string
  delay: number
}

const cityPhrases = [
  "🗽 weekend in nyc?",
  "👙 down 4 miami?",
  "🇯🇵 tokyo adventure?",
  "🇫🇷 paris getaway?",
  "🧘🏽 bali retreat?",
  "🫓 barcelona tapas?",
  "💂 london calling?",
  "🇮🇹 rome holiday?",
  "⛷️ski trip to aspen?",
  "🏝️ beach day in hawaii?",
  "🚤 amsterdam canals?",
  "🎭 sydney opera house?",
  "🥾 hiking in iceland?",
  "🎰 vegas bachelor party?",
  "🌮 mexico city tacos?",
]

const bubbleColors = [
  "bg-travel-blue text-blue-900",
  "bg-travel-pink text-pink-900",
  "bg-travel-yellow text-amber-900",
  "bg-travel-purple text-purple-900",
  "bg-travel-mint text-emerald-900",
  "bg-travel-peach text-orange-900",
]

const createCitySlug = (text: string): string => {
  const cityMatch = text.match(/\b(nyc|miami|tokyo|paris|bali|barcelona|london|rome|aspen|hawaii|amsterdam|sydney|iceland|vegas|mexico city)\b/i);
  if (cityMatch && cityMatch[0]) {
    return cityMatch[0].toLowerCase().replace(/\s+/g, "-");
  }
  return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").substring(0, 20);
}

// Sub-component for individual bubble animation
interface BubbleItemProps {
  bubble: CityBubble;
  isInView: boolean;
}

// Simplified BubbleItem without scroll transforms
function BubbleItem({ bubble, isInView }: BubbleItemProps) {
  const index = bubble.id;
  
  return (
    <Link key={bubble.id} href={`/destinations/${bubble.citySlug}`} passHref>
      <motion.div
        className={`
          absolute rounded-full lowercase font-medium
          shadow-sm cursor-pointer hover:scale-105 transition-transform duration-200 ease-in-out
          whitespace-nowrap flex items-center justify-center text-center
          ${bubble.color} ${bubble.sizeClass}
        `}
        style={{
          left: bubble.x,
          top: bubble.y,
        }}
        initial={{ scale: 0, opacity: 0 }}
        animate={isInView ? 
          { 
            scale: 1, 
            opacity: 0.95,
            transition: {
              delay: bubble.delay,
              duration: 0.6,
              type: "spring",
              stiffness: 180,
              damping: 15
            }
          } : 
          { scale: 0, opacity: 0 }
        }
        whileHover={{ 
          scale: 1.15,
          opacity: 1, 
          zIndex: 20,
          transition: { duration: 0.2 }
        }}
      >
        {bubble.text}
      </motion.div>
    </Link>
  )
}

export function CityBubbles() {
  const [bubbles, setBubbles] = useState<CityBubble[]>([])
  const [windowWidth, setWindowWidth] = useState(0)
  const bubblesRef = useRef(null)
  const isInView = useInView(bubblesRef, { once: false, amount: 0.15 })

  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth || 0)
    
    // Update window width on resize
    const handleResize = () => {
      setWindowWidth(window.innerWidth || 0)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const shuffled = [...cityPhrases].sort(() => 0.5 - Math.random())
    const isMobile = windowWidth < 768
    
    // Cap to 6 bubbles on mobile, 8 on desktop
    const maxBubbles = isMobile ? 6 : 8
    const selectedPhrases = shuffled.slice(0, maxBubbles)

    // Mobile grid with more defined spacing to prevent overlap
    const mobileGrid = [
      // Left column
      { x: "5%", y: "2%" },    // Top left
      { x: "8%", y: "35%" },  // Middle left
      { x: "5%", y: "70%" },  // Lower left
      
      // Right column
      { x: "60%", y: "15%" },  // Top right
      { x: "65%", y: "50%" },  // Middle right
      { x: "58%", y: "85%" },  // Lower right
    ]

    // Desktop grid adjusted for less overlap
    const desktopGrid = [
      { x: "5%", y: "8%" },
      { x: "28%", y: "30%" }, 
      { x: "50%", y: "5%" },  
      { x: "70%", y: "25%" }, 
      { x: "85%", y: "12%" }, 
      { x: "15%", y: "60%" }, 
      { x: "40%", y: "75%" }, 
      { x: "65%", y: "65%" }, 
    ]

    const grid = isMobile ? mobileGrid : desktopGrid

    // Use only as many grid positions as we have phrases
    const positions = grid.slice(0, selectedPhrases.length).map((pos) => {
      // Minimal random offset, mostly for desktop
      const xOffset = Math.random() * (isMobile ? 0 : 1) - (isMobile ? 0 : 0.5)
      const yOffset = Math.random() * (isMobile ? 0 : 2) - (isMobile ? 0 : 1)
      return {
        x: `calc(${pos.x} + ${xOffset}%)`,
        y: `calc(${pos.y} + ${yOffset}%)`, 
      }
    })

    const newBubbles = selectedPhrases.map((text, index) => {
      // Consistent sizes for better visual hierarchy
      const sizeClasses = isMobile ? [
        "px-2.5 py-1 text-xs", // Small
        "px-3 py-1 text-xs", // Small
        "px-3 py-1.5 text-sm", // Medium
      ] : [
        "px-3 py-1 text-xs",
        "px-4 py-1.5 text-sm",
        "px-5 py-2 text-base",
      ]
      
      const citySlug = createCitySlug(text)

      return {
        id: index,
        text,
        citySlug,
        color: bubbleColors[index % bubbleColors.length],
        sizeClass: sizeClasses[index % sizeClasses.length],
        x: positions[index].x,
        y: positions[index].y,
        delay: index * 0.15,
      }
    })

    setBubbles(newBubbles)
  }, [windowWidth])

  return (
    <div 
      ref={bubblesRef}
      className="relative w-full mx-auto overflow-hidden py-24 md:py-20"
    >
      <div className="relative w-full h-full px-4 md:px-6">
        {bubbles.map((bubble) => (
          <BubbleItem 
            key={bubble.id} 
            bubble={bubble} 
            isInView={isInView} 
          />
        ))}
      </div>
    </div>
  )
}
