"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, Sparkles, ChevronRight, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

// SVG texture overlay for gradients
const TextureOverlay = () => (
  <div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)" />
    </svg>
  </div>
)

// Abstract shape SVG component
const AbstractShape = () => (
  <div className="absolute right-0 bottom-0 w-64 h-64 opacity-80 pointer-events-none">
    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="#A78BFA"
        d="M34.2,-55.1C42.3,-46.9,46,-34.4,52.5,-22.3C59,-10.1,68.4,1.7,70.1,14.9C71.7,28.1,65.5,42.7,54.5,52.4C43.5,62.2,27.6,67.1,13.2,66.6C-1.2,66,-14.2,59.9,-26.9,52.7C-39.7,45.5,-52.3,37.2,-60.1,25C-67.9,12.9,-71,-3.1,-68.1,-17.8C-65.3,-32.6,-56.5,-46.1,-44.2,-54C-31.9,-61.8,-15.9,-63.9,-1.2,-62.1C13.6,-60.3,27.1,-54.7,34.2,-55.1Z"
        transform="translate(100 100)"
      />
    </svg>
  </div>
)

// Sparkle animation component
interface SparkleProps {
  size: number;
  color: string;
  top: number;
  left: number;
  delay: number;
}

const Sparkle = ({ size, color, top, left, delay }: SparkleProps) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      backgroundColor: color,
      top: `${top}%`,
      left: `${left}%`,
    }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: [0, 1, 0],
      opacity: [0, 1, 0],
    }}
    transition={{
      duration: 1,
      delay: delay,
      repeat: Infinity,
      repeatDelay: 3,
    }}
  />
)

// SparkleEffect component
const SparkleEffect = () => (
  <>
    <Sparkle size={6} color="#fff" top={20} left={80} delay={0} />
    <Sparkle size={4} color="#fff" top={30} left={70} delay={0.1} />
    <Sparkle size={8} color="#fff" top={15} left={85} delay={0.2} />
    <Sparkle size={5} color="#fff" top={25} left={75} delay={0.3} />
    <Sparkle size={3} color="#fff" top={18} left={78} delay={0.4} />
  </>
)

// Heart animation component
export const HeartButton = () => {
  const [liked, setLiked] = useState(false)

  return (
    <div className="relative inline-block">
      <button
        className="relative z-10"
        onClick={() => setLiked(!liked)}
        aria-label={liked ? "Unlike" : "Like"}
      >
        <Heart
          className={`h-8 w-8 transition-colors duration-300 ${
            liked ? "fill-rose-500 text-rose-500" : "text-gray-400"
          }`}
        />
      </button>
      <AnimatePresence>
        {liked && (
          <motion.div
            className="absolute inset-0 z-0"
            initial={{ scale: 0 }}
            animate={{ scale: 1.5 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.35, type: "spring" }}
          >
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500 opacity-0" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Our Page component
export default function DesignSandbox() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Hero section with texture overlay */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900 via-violet-800 to-indigo-900"></div>
        <TextureOverlay />
        <AbstractShape />
        
        <div className="container relative z-10 mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-6xl font-bold mb-4 tracking-tight">
              Discover new <span className="text-yellow-300">adventures</span>
            </h1>
            <p className="text-xl font-light leading-relaxed mb-8 text-white/90 max-w-2xl">
              Travel experiences that transform how you see the world, curated by experts and fellow travelers.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Button className="bg-white text-indigo-900 hover:bg-white/90 text-base font-medium rounded-full px-8 py-6">
                Start planning
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" className="border-white text-white hover:bg-white/10 rounded-full px-8 py-6">
                Explore templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Cards showcase section */}
      <section className="py-20 bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="font-serif text-4xl font-bold mb-4">Popular destinations</h2>
              <p className="text-white/60 max-w-xl">Places that inspire wanderlust and create unforgettable memories</p>
            </div>
            <Link 
              href="#" 
              className="flex items-center text-violet-300 hover:text-violet-200 transition-colors"
            >
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="bg-transparent border-0 overflow-hidden rounded-xl">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
                <TextureOverlay />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="font-serif text-2xl font-bold mb-1">Paris, France</h3>
                  <p className="text-white/80 text-sm">City of Lights & Love</p>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <HeartButton />
                </div>
                <Image 
                  src="https://images.unsplash.com/photo-1502602898657-3e91760cbb34"
                  alt="Paris, France" 
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Card>

            {/* Card 2 with sparkle effect */}
            <Card className="bg-transparent border-0 overflow-hidden rounded-xl">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
                <TextureOverlay />
                <div className="absolute bottom-6 left-6 z-20">
                  <div className="relative">
                    <h3 className="font-serif text-2xl font-bold mb-1">Tokyo, Japan</h3>
                    <p className="text-white/80 text-sm">Ultramodern meets traditional</p>
                    <div className="absolute -top-8 right-0">
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="relative"
                      >
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <SparkleEffect />
                      </motion.div>
                    </div>
                  </div>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <HeartButton />
                </div>
                <Image 
                  src="https://images.unsplash.com/photo-1536098561742-ca998e48cbcc"
                  alt="Tokyo, Japan" 
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Card>

            {/* Card 3 */}
            <Card className="bg-transparent border-0 overflow-hidden rounded-xl">
              <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
                <TextureOverlay />
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="font-serif text-2xl font-bold mb-1">Santorini, Greece</h3>
                  <p className="text-white/80 text-sm">Whitewashed paradise</p>
                </div>
                <div className="absolute top-4 right-4 z-20">
                  <HeartButton />
                </div>
                <Image 
                  src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff"
                  alt="Santorini, Greece" 
                  fill
                  className="object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Typography showcase */}
      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-serif text-4xl font-bold mb-12 text-center">Typography Styles</h2>
          
          <div className="space-y-10">
            <div>
              <h3 className="text-xl text-violet-300 mb-4">Headings (Serif)</h3>
              <div className="space-y-4">
                <h1 className="font-serif text-5xl font-bold">Level 1 Heading</h1>
                <h2 className="font-serif text-4xl font-bold">Level 2 Heading</h2>
                <h3 className="font-serif text-3xl font-bold">Level 3 Heading</h3>
                <h4 className="font-serif text-2xl font-bold">Level 4 Heading</h4>
              </div>
            </div>

            <div>
              <h3 className="text-xl text-violet-300 mb-4">Body Text (Sans Serif)</h3>
              <div className="space-y-4">
                <p className="text-xl font-light leading-relaxed">Large text for introductions and key statements that need emphasis.</p>
                <p className="text-base leading-relaxed">Regular text for the main content of your pages. Clear and readable.</p>
                <p className="text-sm leading-relaxed text-white/70">Smaller text for secondary information, captions and supporting details.</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl text-violet-300 mb-4">Buttons & Interactive Elements</h3>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button className="bg-violet-600 hover:bg-violet-500 rounded-full">Primary Action</Button>
                <Button variant="outline" className="rounded-full">Secondary Action</Button>
                <Button variant="ghost" className="rounded-full">Tertiary Action</Button>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full px-6 py-3 font-medium inline-flex items-center cursor-pointer"
                >
                  Interactive Button
                  <ChevronRight className="ml-2 h-4 w-4" />
                </motion.div>
                
                <motion.div
                  whileHover={{ x: 5 }}
                  className="rounded-full px-6 py-3 font-medium inline-flex items-center text-violet-300 hover:text-violet-200 cursor-pointer"
                >
                  Text Link
                  <ArrowRight className="ml-2 h-4 w-4" />
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
} 