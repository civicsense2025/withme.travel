"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, Users, Calendar } from "lucide-react";
export function AppTourScreen({ tourStep, onNext, onSkip }) {
    const tourContent = [
        {
            icon: <ClipboardList className="h-12 w-12 text-primary"/>,
            title: "create & share trip ideas",
            description: "invite friends to collaborate on your dream getaways",
        },
        {
            icon: <Users className="h-12 w-12 text-primary"/>,
            title: "make decisions together",
            description: "no more endless group chats - vote on dates, stays & activities",
        },
        {
            icon: <Calendar className="h-12 w-12 text-primary"/>,
            title: "keep everything organized",
            description: "all your plans, bookings & memories in one place",
        },
    ];
    const currentContent = tourContent[tourStep - 1];
    return (<Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6 text-center">
        <div className="mb-6">{currentContent.icon}</div>
        <h1 className="text-xl font-bold mb-2">{currentContent.title}</h1>
        <p className="text-muted-foreground mb-8">{currentContent.description}</p>

        <div className="flex flex-col gap-3">
          <Button onClick={onNext} size="lg">
            {tourStep < 3 ? "next →" : "finish"}
          </Button>
          {tourStep === 1 && (<Button variant="ghost" size="sm" onClick={onSkip}>
              skip tour
            </Button>)}
        </div>

        <div className="flex justify-center gap-2 mt-6">
          {[1, 2, 3].map((step) => (<div key={step} className={`h-2 w-2 rounded-full ${step === tourStep ? "bg-primary" : "bg-muted"}`}/>))}
        </div>
      </CardContent>
    </Card>);
}
