"use client"

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { LoginForm } from '@/components/login-form'
import { MapPin, Heart, Users, ClipboardList } from 'lucide-react'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Sign in to withme.travel</DialogTitle>
        </VisuallyHidden>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Benefits Section */}
          <div className="bg-gradient-to-br from-teal-500/20 via-primary/20 to-purple-500/20 dark:from-teal-500/10 dark:via-primary/10 dark:to-purple-500/10 p-8 flex flex-col justify-center relative">
            <div className="absolute inset-0 backdrop-blur-[2px]" />
            <div className="relative">
              <h2 className="text-2xl font-bold mb-4">
                tired of messy group travel?
              </h2>
              <p className="text-muted-foreground mb-8">
                we get it – coordinating trips with friends can be chaotic. let's fix that together.
              </p>
              <div className="space-y-6">
                <div className="flex items-start gap-3">
                  <ClipboardList className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">no more spreadsheet chaos</h3>
                    <p className="text-sm text-muted-foreground">finally, a place to organize everything without endless excel tabs and google docs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">everyone's actually involved</h3>
                    <p className="text-sm text-muted-foreground">share ideas, vote on plans, and keep the whole crew in sync (no more group chat chaos)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Heart className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">save ideas for later</h3>
                    <p className="text-sm text-muted-foreground">spot something cool? bookmark it for your next trip instead of losing it forever</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium mb-1">actually helpful local tips</h3>
                    <p className="text-sm text-muted-foreground">skip the tourist traps with insider recommendations that your group will love</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Form Section */}
          <div className="p-8 flex items-center justify-center min-h-[600px]">
            <div className="w-full max-w-sm">
              <LoginForm />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 