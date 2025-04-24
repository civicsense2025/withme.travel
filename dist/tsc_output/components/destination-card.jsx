"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LikeButton } from "@/components/like-button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
// SVG texture overlay for gradients
const TextureOverlay = () => (<div className="absolute inset-0 opacity-20 mix-blend-soft-light pointer-events-none">
    <svg width="100%" height="100%" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
      <filter id="noise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
        <feColorMatrix type="saturate" values="0"/>
      </filter>
      <rect width="100%" height="100%" filter="url(#noise)"/>
    </svg>
  </div>);
// Heart animation component
const HeartButton = () => {
    const [liked, setLiked] = useState(false);
    return (<div className="relative inline-block">
      <button className="relative z-10" onClick={() => setLiked(!liked)} aria-label={liked ? "Unlike" : "Like"}>
        <Heart className={`h-8 w-8 transition-colors duration-300 ${liked ? "fill-rose-500 text-rose-500" : "text-gray-400"}`}/>
      </button>
      <AnimatePresence>
        {liked && (<motion.div className="absolute inset-0 z-0" initial={{ scale: 0 }} animate={{ scale: 1.5 }} exit={{ scale: 0 }} transition={{ duration: 0.35, type: "spring" }}>
            <Heart className="h-8 w-8 text-rose-500 fill-rose-500 opacity-0"/>
          </motion.div>)}
      </AnimatePresence>
    </div>);
};
export function DestinationCard({ destination, href, className = "" }) {
    const { city, country, image_url, description, image_metadata, emoji } = destination;
    const [showSneak, setShowSneak] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    // Render rating stars
    const renderRating = (rating, max = 5) => {
        if (rating === null || rating === undefined)
            return "N/A";
        const stars = [];
        for (let i = 0; i < max; i++) {
            stars.push(<span key={i} className={i < rating ? "text-yellow-500" : "text-gray-300"}>
          ★
        </span>);
        }
        return <div className="flex">{stars}</div>;
    };
    // Fallback for href if not provided
    const cardHref = href || `/destinations/${city.toLowerCase().replace(/\s+/g, "-")}`;
    // Fallback for image if not available
    const imageUrl = image_url || `/placeholder.svg?height=600&width=400&query=${encodeURIComponent(city)}`;
    // Handle mouse enter
    const handleMouseEnter = () => {
        const timeout = setTimeout(() => {
            setShowSneak(true);
        }, 3000);
        setHoverTimeout(timeout);
    };
    // Handle mouse leave
    const handleMouseLeave = () => {
        if (hoverTimeout) {
            clearTimeout(hoverTimeout);
            setHoverTimeout(null);
        }
        setShowSneak(false);
    };
    // Generate descriptive alt text
    const generateAltText = () => {
        const baseAlt = (image_metadata === null || image_metadata === void 0 ? void 0 : image_metadata.alt_text) || `Scenic view of ${city}, ${country}`;
        const features = [];
        if (destination.beach_quality >= 4)
            features.push('beautiful beaches');
        if (destination.cultural_attractions >= 4)
            features.push('cultural landmarks');
        if (destination.outdoor_activities >= 4)
            features.push('outdoor attractions');
        return features.length > 0
            ? `${baseAlt} featuring ${features.join(', ')}`
            : baseAlt;
    };
    const altText = generateAltText();
    // Handle like button click
    const handleLikeClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };
    // Generate highlights for sneak peek
    const getHighlights = () => {
        const highlights = [];
        if (destination.cuisine_rating >= 4)
            highlights.push('Amazing Food');
        if (destination.nightlife_rating >= 4)
            highlights.push('Vibrant Nightlife');
        if (destination.cultural_attractions >= 4)
            highlights.push('Rich Culture');
        if (destination.outdoor_activities >= 4)
            highlights.push('Outdoor Paradise');
        if (destination.beach_quality >= 4)
            highlights.push('Beautiful Beaches');
        return highlights.slice(0, 3); // Return top 3 highlights
    };
    return (<Link href={cardHref}>
      <Card className={`
          group bg-transparent border-0 overflow-hidden rounded-xl h-full 
          transition-all duration-500 ease-out
          hover:shadow-xl hover:scale-[1.02]
          relative
          ${className}
        `} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent z-10"></div>
          
          {/* Texture overlay for depth */}
          <TextureOverlay />
          
          {/* Destination info */}
          <div className="absolute bottom-6 left-6 z-20">
            <h3 className="text-2xl font-bold mb-1 text-white group-hover:translate-y-[-4px] transition-transform duration-300">
              {emoji && <span className="mr-2" role="img" aria-label={`${city} emoji`}>{emoji}</span>}
              {city}
            </h3>
            <p className="text-white/80 text-sm font-medium group-hover:translate-y-[-2px] transition-transform duration-300 delay-75">{country}</p>
          </div>
          
          {/* Like button */}
          <div className="absolute top-4 right-4 z-20" onClick={handleLikeClick}>
            <LikeButton itemId={destination.id} itemType="destination" size="sm" className="shadow-sm"/>
          </div>

          {/* Attribution info button */}
          {(image_metadata === null || image_metadata === void 0 ? void 0 : image_metadata.attribution) && (<div className="absolute bottom-6 right-6 z-20">
              <TooltipProvider delayDuration={100}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="rounded-full bg-black/40 p-1.5 text-white/80 hover:bg-black/60 transition-colors" onClick={(e) => e.preventDefault()} aria-label="Image attribution information">
                      <Info className="h-3.5 w-3.5"/>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left" sideOffset={5} className="bg-black/90 text-white border-none shadow-lg">
                    <p className="text-xs">{image_metadata.attribution}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>)}
          
          {/* Image with hover effect */}
          <div className="relative h-full w-full">
            <Image src={imageUrl} alt={altText} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-110"/>
          </div>

          {/* Sneak peek panel */}
          <AnimatePresence>
            {showSneak && (<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent z-30 flex flex-col justify-end p-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Highlights</h4>
                    <div className="flex flex-wrap gap-2">
                      {getHighlights().map((highlight, index) => (<Badge key={index} variant="outline" className="bg-white/10 text-white border-white/20">
                          {highlight}
                        </Badge>))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-1">Best Time to Visit</h4>
                    <p className="text-white/80 text-sm">{destination.best_season || 'Year-round'}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {destination.avg_cost_per_day && (<div>
                        <h4 className="text-sm font-medium text-white/80">Daily Budget</h4>
                        <p className="text-white font-semibold">${destination.avg_cost_per_day}/day</p>
                      </div>)}
                    {destination.safety_rating && (<div>
                        <h4 className="text-sm font-medium text-white/80">Safety Rating</h4>
                        <div className="text-white">{renderRating(destination.safety_rating, 5)}</div>
                      </div>)}
                  </div>
                </div>
              </motion.div>)}
          </AnimatePresence>
        </div>
      </Card>
    </Link>);
}
