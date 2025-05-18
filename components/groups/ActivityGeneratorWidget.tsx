/**
 * ActivityGeneratorWidget - A component for generating activity ideas for group plans
 */

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Card } from "@/components/ui/card";
import { PlusCircle, RefreshCw, Lightbulb } from "lucide-react";

// Activity idea types
export type ActivityIdeaType = "food" | "sightseeing" | "adventure" | "cultural" | "relaxation";

interface ActivityGeneratorWidgetProps {
  /** The group ID */
  groupId: string;
  /** The plan ID */
  planId: string;
  /** The destination ID if available */
  destinationId?: string;
  /** Handler for adding an idea */
  onAddIdea: (idea: { title: string; description: string; type?: string }) => Promise<void>;
  /** Handler for closing the widget */
  onClose: () => void;
}

/**
 * Widget that generates activity ideas for group plans
 */
export function ActivityGeneratorWidget({
  groupId,
  planId,
  destinationId,
  onAddIdea,
  onClose
}: ActivityGeneratorWidgetProps) {
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ActivityIdeaType | null>(null);
  const [generatedIdeas, setGeneratedIdeas] = useState<Array<{ title: string; description: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  // Ideas for different categories
  const predefinedIdeas = {
    food: [
      { title: "Local Food Tour", description: "Try local specialties with a guided food tour" },
      { title: "Visit a Food Market", description: "Explore local ingredients and flavors at a food market" },
      { title: "Fine Dining Experience", description: "Make a reservation at a top-rated restaurant" },
      { title: "Cooking Class", description: "Learn to make local dishes in a hands-on cooking class" }
    ],
    sightseeing: [
      { title: "Historical Tour", description: "Visit the main historical attractions" },
      { title: "Scenic Viewpoints", description: "Find the best spots for photos and views" },
      { title: "Walking Tour", description: "Take a guided walking tour of the main sites" },
      { title: "Museum Visit", description: "Explore the local culture through museums" }
    ],
    adventure: [
      { title: "Hiking Expedition", description: "Find a nearby trail for a group hike" },
      { title: "Water Sports", description: "Try kayaking, paddleboarding, or other water activities" },
      { title: "Biking Tour", description: "Explore the area on a bike tour" },
      { title: "Zip-lining or Adventure Park", description: "Get an adrenaline rush at an adventure park" }
    ],
    cultural: [
      { title: "Local Performance", description: "Attend a theater, music, or dance performance" },
      { title: "Art Gallery Tour", description: "Explore local art and crafts" },
      { title: "Cultural Workshop", description: "Learn a traditional craft or skill" },
      { title: "Historical Landmarks", description: "Visit significant cultural or historical sites" }
    ],
    relaxation: [
      { title: "Spa Day", description: "Book a spa treatment or wellness activity" },
      { title: "Scenic Picnic", description: "Find a beautiful spot for a group picnic" },
      { title: "Beach Day", description: "Relax at a nearby beach or lake" },
      { title: "Park or Garden Visit", description: "Enjoy nature at a local park or garden" }
    ]
  };

  const generateIdeas = () => {
    if (!selectedCategory) {
      setError("Please select a category first");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call with predefined ideas
    setTimeout(() => {
      setGeneratedIdeas(predefinedIdeas[selectedCategory]);
      setLoading(false);
    }, 1000);
  };

  const handleAddIdea = async (idea: { title: string; description: string }) => {
    try {
      setLoading(true);
      await onAddIdea({
        ...idea,
        type: selectedCategory || 'other'
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to add idea. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(["food", "sightseeing", "adventure", "cultural", "relaxation"] as ActivityIdeaType[]).map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </Button>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Button 
          onClick={generateIdeas} 
          disabled={!selectedCategory || loading}
          className="flex-1"
        >
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : <Lightbulb className="mr-2 h-4 w-4" />}
          Generate Ideas
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => {
            setSelectedCategory(null);
            setGeneratedIdeas([]);
          }}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
      
      {error && <p className="text-red-500 text-sm">{error}</p>}
      
      {generatedIdeas.length > 0 && (
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {generatedIdeas.map((idea, index) => (
            <Card key={index} className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-sm">{idea.title}</h4>
                  <p className="text-xs text-muted-foreground">{idea.description}</p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => handleAddIdea(idea)}
                  disabled={loading}
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 