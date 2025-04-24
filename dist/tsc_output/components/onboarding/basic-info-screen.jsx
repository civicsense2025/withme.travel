"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function BasicInfoScreen({ userData, onInputChange, onNext, onBack }) {
    return (<Card className="border-0 shadow-lg">
      <CardContent className="pt-6 pb-8 px-6">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">👋</div>
          <h1 className="text-2xl font-bold mb-2 lowercase">let's get to know each other!</h1>
        </div>

        <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            onNext();
        }}>
          <div className="space-y-2">
            <Label htmlFor="firstName">first name</Label>
            <Input id="firstName" value={userData.firstName} onChange={(e) => onInputChange("firstName", e.target.value)} placeholder="your name" required/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">email</Label>
            <Input id="email" type="email" value={userData.email} onChange={(e) => onInputChange("email", e.target.value)} placeholder="you@example.com" required/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">create password</Label>
            <Input id="password" type="password" value={userData.password} onChange={(e) => onInputChange("password", e.target.value)} placeholder="••••••••" required minLength={6}/>
            <p className="text-xs text-muted-foreground">at least 6 characters</p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1 lowercase">
              back
            </Button>
            <Button type="submit" className="flex-1 lowercase">
              continue
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>);
}
