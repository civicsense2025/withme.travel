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

    // Mobile grid - Updated for single vertical line, shifted left
    const mobileGrid = [
      { x: "45%", y: "5%" },   // Shifted left from 50%
      { x: "45%", y: "20%" },  // Shifted left from 50%
      { x: "45%", y: "35%" },  // Shifted left from 50%
      { x: "45%", y: "50%" },  // Shifted left from 50%
      { x: "45%", y: "65%" },  // Shifted left from 50%
      { x: "45%", y: "80%" },  // Shifted left from 50%
    ]

    // Desktop grid - Adjusted X values to shift the cluster left
    const desktopGrid = [
      { x: "10%", y: "15%" }, // Shifted left from 18%
      { x: "27%", y: "40%" }, // Shifted left from 35%
      { x: "42%", y: "10%" }, // Shifted left from 50%
      { x: "57%", y: "35%" }, // Shifted left from 65%
      { x: "70%", y: "20%" }, // Shifted left from 78%
      { x: "14%", y: "70%" }, // Shifted left from 22%
      { x: "37%", y: "75%" }, // Shifted left from 45%
      { x: "60%", y: "65%" }, // Shifted left from 68%
    ]

    const grid = isMobile ? mobileGrid : desktopGrid

    // Use only as many grid positions as we have phrases
    // Pass index to allow staggering based on position
    const positions = grid.slice(0, selectedPhrases.length).map((pos, index) => {
      // Keep desktop random offset minimal, adjust mobile offset for centering and staggering
      // For mobile, alternate a small horizontal offset to stagger the line
      const mobileOffsetPercentage = index % 2 === 0 ? -5 : 5; // Alternate between -5% and +5% from center
      const xOffsetVal = isMobile ? mobileOffsetPercentage : (Math.random() * 2.0 - 1.0); // Mobile: Alternating offset %, Desktop: Small random %
      const yOffsetVal = isMobile ? (Math.random() * 4.0 - 2.0) : (Math.random() * 4.0 - 2.0); // Small random Y offset for both

      return {
        // Use the calculated offset value. Positive/negative is handled by the value itself.
        x: `calc(${pos.x} + ${xOffsetVal}%)`,
        y: `calc(${pos.y} + ${yOffsetVal}%)`,
      }
    })

    const newBubbles = selectedPhrases.map((text, index) => {
      // Consistent sizes for better visual hierarchy - Increased mobile sizes
      const sizeClasses = isMobile ? [
        "px-3.5 py-1.5 text-sm", // Larger small
        "px-4 py-1.5 text-sm", // Larger medium
        "px-4 py-2 text-base", // Larger large
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
      className="relative w-full mx-auto overflow-hidden py-16 md:py-20" // Reduced mobile padding slightly
    >
      {/* Ensure container has enough height to prevent clipping if bubbles position low */} 
      {/* Increased mobile min-height to accommodate vertical layout */}
      <div className="relative w-full min-h-[350px] md:min-h-[150px] h-full px-4 md:px-6"> 
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
