"use client";
import React from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ItineraryFilters } from "@/components/itinerary-filters";
import { ItineraryTemplateCard } from "@/components/itinerary-template-card";
import { staggerContainer } from "@/utils/animation";
export function ClientWrapper({ itineraries, destinations }) {
    // Convert itineraries to match the expected type
    const formattedItineraries = itineraries.map(item => (Object.assign(Object.assign({}, item), { description: item.description || "" })));
    return (<>
      <motion.div className="mb-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.4 }}>
        <ItineraryFilters destinations={destinations}/>
      </motion.div>

      {formattedItineraries.length === 0 ? (<motion.div className="text-center py-16" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
          <h3 className="text-xl font-semibold mb-2">No itineraries found yet</h3>
          <p className="text-muted-foreground mb-6">Be the first to share your travel experience!</p>
          <Button asChild>
            <Link href="/itineraries/submit" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4"/>
              Submit Your Itinerary
            </Link>
          </Button>
        </motion.div>) : (<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" variants={staggerContainer} initial="hidden" animate="visible">
          {formattedItineraries.map((itinerary, index) => (<ItineraryTemplateCard key={itinerary.id} index={index} itinerary={itinerary}/>))}
        </motion.div>)}
    </>);
}
