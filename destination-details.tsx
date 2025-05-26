"use client"

import type React from "react"

import { useState } from "react"
import { Clock, DollarSign, Heart, Globe, Calendar, Accessibility, Lightbulb, Leaf, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type SectionProps = {
  title: string
  emoji: string
  defaultOpen?: boolean
  children: React.ReactNode
}

function CollapsibleSection({ title, emoji, defaultOpen = false, children }: SectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-gray-100 py-5">
      <button onClick={() => setIsOpen(!isOpen)} className="flex w-full items-center justify-between text-left">
        <div className="flex items-center">
          <span className="text-2xl mr-3" role="img" aria-hidden="true">
            {emoji}
          </span>
          <h2 className="text-xl font-medium">{title}</h2>
        </div>
        <ChevronDown
          className={cn("h-5 w-5 text-gray-400 transition-transform duration-200", isOpen && "rotate-180")}
        />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pt-5 pb-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function DestinationDetails() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white p-8 rounded-3xl">
      <h1 className="text-2xl font-semibold mb-6">Paris Travel Details</h1>

      <CollapsibleSection title="Essentials" emoji="✨" defaultOpen={true}>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start space-x-4">
              <Clock className="h-5 w-5 text-black mt-1" />
              <div>
                <h3 className="font-medium text-base">Pace</h3>
                <p className="text-gray-500 mt-1">Moderate with strategic rest periods</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <DollarSign className="h-5 w-5 text-black mt-1" />
              <div>
                <h3 className="font-medium text-base">Daily Budget</h3>
                <p className="text-gray-500 mt-1">$180 USD per day</p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Clock className="h-5 w-5 text-black mt-1" />
              <div>
                <h3 className="font-medium text-base">Typical Start</h3>
                <p className="text-gray-500 mt-1">08:30 AM</p>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Heart className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Perfect For</h3>
              <div className="flex flex-wrap gap-2 mt-3">
                {["Art lovers", "Romantics", "Food enthusiasts", "Architecture admirers"].map((item) => (
                  <span key={item} className="px-4 py-1.5 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Globe className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Languages</h3>
              <p className="text-gray-500 mt-1">French (primary)</p>
              <p className="text-gray-500">English widely available in tourist areas</p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Planning" emoji="🗓️">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Calendar className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Seasonality</h3>
              <div className="mt-3">
                <h4 className="text-sm font-medium">Best times to visit:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-4 py-1.5 bg-green-50 text-green-700 rounded-full text-sm">
                    Spring (April-June)
                  </span>
                  <span className="px-4 py-1.5 bg-amber-50 text-amber-700 rounded-full text-sm">
                    Fall (September-October)
                  </span>
                </div>

                <h4 className="text-sm font-medium mt-4">Times to avoid:</h4>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-sm">
                    August (many local businesses close)
                  </span>
                  <span className="px-4 py-1.5 bg-gray-50 text-gray-500 rounded-full text-sm">
                    Mid-winter (January-February)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Accessibility className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Accessibility</h3>
              <p className="text-gray-500 mt-1">
                Moderate - extensive metro system but many historic sites have stairs; cobblestone streets in historic
                areas
              </p>
            </div>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Local Insights" emoji="💡">
        <div className="space-y-8">
          <div className="flex items-start space-x-4">
            <Lightbulb className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Local Tips</h3>
              <ul className="mt-3 space-y-3 text-gray-500">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>Purchase museum tickets online to avoid long queues</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>The Paris Museum Pass is worth it if visiting 3+ major museums</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>For authentic pastries, look for "Meilleur Ouvrier de France" certification</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <Leaf className="h-5 w-5 text-black mt-1" />
            <div>
              <h3 className="font-medium text-base">Sustainability</h3>
              <ul className="mt-3 space-y-3 text-gray-500">
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>Public transportation focus</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>Support of local artisans and businesses</span>
                </li>
                <li className="flex items-start">
                  <span className="text-black mr-2">•</span>
                  <span>Walking-centric exploration</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}
