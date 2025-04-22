"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type CityBubble = {
  id: number
  text: string
  color: string
  size: string
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

export function CityBubbles() {
  const [bubbles, setBubbles] = useState<CityBubble[]>([])

  useEffect(() => {
    // Shuffle and pick 8 random phrases
    const shuffled = [...cityPhrases].sort(() => 0.5 - Math.random())
    const selectedPhrases = shuffled.slice(0, 8)

    // Create a grid layout to prevent overlap
    const grid = [
      // Top row
      { x: "5%", y: "0%" },
      { x: "30%", y: "0%" },
      { x: "55%", y: "0%" },
      { x: "80%", y: "0%" },
      // Bottom row
      { x: "15%", y: "50%" },
      { x: "40%", y: "50%" },
      { x: "65%", y: "50%" },
      { x: "90%", y: "50%" },
    ]

    // Add some randomness to the positions but maintain the grid
    const positions = grid.map((pos) => {
      const xOffset = Math.random() * 5 - 2.5 // -2.5% to +2.5%
      const yOffset = Math.random() * 10 - 5 // -5% to +5%
      return {
        x: `calc(${pos.x} + ${xOffset}%)`,
        y: `calc(${pos.y} + ${yOffset}px)`,
      }
    })

    // Create bubbles with improved positioning
    const newBubbles = selectedPhrases.map((text, index) => {
      const sizes = ["text-sm", "text-base", "text-lg"]
      const calculatedPosition = positions[index]

      return {
        id: index,
        text,
        color: bubbleColors[index % bubbleColors.length],
        size: sizes[Math.floor(Math.random() * sizes.length)],
        x: calculatedPosition.x,
        y: calculatedPosition.y,
        delay: index * 0.1,
      }
    })

    setBubbles(newBubbles)
  }, [])

  return (
    <div className="relative h-40 w-full max-w-5xl mx-auto my-12 overflow-visible">
      {bubbles.map((bubble: CityBubble, index: number) => {
        const tailClass = index % 2 === 0 ? "rounded-bl-none" : "rounded-br-none"
        return (
          <motion.div
            key={bubble.id}
            className={`
              absolute rounded-full px-4 py-2 lowercase font-medium
              shadow-sm cursor-pointer hover:scale-110 transition-transform
              ${bubble.color} ${bubble.size} ${tailClass}
            `}
            style={{
              left: bubble.x,
              top: bubble.y,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.9 }}
            transition={{
              delay: bubble.delay,
              duration: 0.4,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            whileHover={{ scale: 1.1, opacity: 1 }}
          >
            {bubble.text}
          </motion.div>
        )
      })}
    </div>
  )
}
