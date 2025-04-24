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
    // Ensure window is defined before accessing innerWidth
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth || 0)
    const handleResize = () => {
        setWindowWidth(window.innerWidth || 0)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
    } 
  }, [])

  useEffect(() => {
    // Return early if windowWidth is 0 to avoid errors during SSR or initial render
    if (windowWidth === 0) return;
    
    const shuffled = [...cityPhrases].sort(() => 0.5 - Math.random())
    const isMobile = windowWidth < 768

    // Cap to 6 bubbles on mobile, 8 on desktop
    const maxBubbles = isMobile ? 6 : 8
    const selectedPhrases = shuffled.slice(0, maxBubbles)

    // Mobile grid - Keep as is from previous fix
    const mobileGrid = [
      // Left column
      { x: "5%", y: "2%" },    
      { x: "8%", y: "35%" },  
      { x: "5%", y: "70%" },  
      // Right column
      { x: "60%", y: "15%" },  
      { x: "65%", y: "50%" },  
      { x: "58%", y: "85%" },  
    ]

    // Desktop grid - Adjusted X values to center the cluster more
    const desktopGrid = [
      { x: "18%", y: "15%" }, // Moved in from 10%
      { x: "35%", y: "40%" }, // Moved in from 30%
      { x: "50%", y: "10%" }, // Already centered
      { x: "65%", y: "35%" }, // Moved in from 70%
      { x: "78%", y: "20%" }, // Moved in from 85%
      { x: "22%", y: "70%" }, // Moved in from 15%
      { x: "45%", y: "75%" }, // Moved in slightly from 40%
      { x: "68%", y: "65%" }, // Moved in from 65%
    ]

    const grid = isMobile ? mobileGrid : desktopGrid

    // Use only as many grid positions as we have phrases
    const positions = grid.slice(0, selectedPhrases.length).map((pos) => {
      // Keep desktop random offset minimal
      const xOffset = Math.random() * (isMobile ? 0.1 : 2.0) - (isMobile ? 0.05 : 1.0)
      const yOffset = Math.random() * (isMobile ? 0.2 : 4.0) - (isMobile ? 0.1 : 2.0)
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
        // Use 3 sizes for desktop for more variation
        "px-4 py-1.5 text-sm", // Medium
        "px-5 py-2 text-base", // Large
        "px-3 py-1 text-xs",   // Small
      ]
      
      const citySlug = createCitySlug(text)

      return {
        id: index,
        text,
        citySlug,
        color: bubbleColors[index % bubbleColors.length],
        // Ensure correct size class assignment for desktop
        sizeClass: sizeClasses[index % sizeClasses.length],
        x: positions[index].x,
        y: positions[index].y,
        delay: index * 0.15, 
      }
    })

    setBubbles(newBubbles)
    // Add windowWidth to dependency array to recalculate on resize
  }, [windowWidth]) 

  return (
    <div 
      ref={bubblesRef}
      className="relative w-full mx-auto overflow-hidden py-24 md:py-20"
    >
      {/* Ensure container has enough height to prevent clipping if bubbles position low */} 
      <div className="relative w-full min-h-[250px] md:min-h-[150px] h-full px-4 md:px-6"> 
        {bubbles.map((bubble) => (
          // Render the simplified BubbleItem
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
