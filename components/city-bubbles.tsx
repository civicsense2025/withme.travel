"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
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

export function CityBubbles() {
  const [bubbles, setBubbles] = useState<CityBubble[]>([])

  useEffect(() => {
    const shuffled = [...cityPhrases].sort(() => 0.5 - Math.random())
    const selectedPhrases = shuffled.slice(0, 8)

    const grid = [
      { x: "5%", y: "10%" },
      { x: "25%", y: "30%" },
      { x: "45%", y: "10%" },
      { x: "65%", y: "40%" },
      { x: "85%", y: "20%" },
      { x: "15%", y: "60%" },
      { x: "35%", y: "75%" },
      { x: "55%", y: "60%" },
      { x: "75%", y: "70%" },
    ]

    const positions = grid.map((pos) => {
      const xOffset = Math.random() * 4 - 2
      const yOffset = Math.random() * 8 - 4
      return {
        x: `calc(${pos.x} + ${xOffset}%)`,
        y: `calc(${pos.y} + ${yOffset}px)`,
      }
    })

    const newBubbles = selectedPhrases.map((text, index) => {
      const sizeClasses = [
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
        delay: index * 0.1,
      }
    })

    setBubbles(newBubbles)
  }, [])

  return (
    <div className="relative h-48 w-full max-w-4xl mx-auto my-12 flex justify-center items-center overflow-visible">
      <div className="relative w-full h-full">
        {bubbles.map((bubble: CityBubble, index: number) => {
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
                animate={{ scale: 1, opacity: 0.9 }}
                transition={{
                  delay: bubble.delay,
                  duration: 0.4,
                  type: "spring",
                  stiffness: 260,
                  damping: 20,
                }}
                whileHover={{ scale: 1.1, opacity: 1, zIndex: 10 }}
              >
                {bubble.text}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
