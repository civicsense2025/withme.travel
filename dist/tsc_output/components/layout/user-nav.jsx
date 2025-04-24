"use client";
import Link from "next/link";
import { LogOut, Settings, User, Map, PlusCircle, Bookmark } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth-provider";
import { PAGE_ROUTES } from "@/utils/constants";
export function UserNav() {
    var _a, _b, _c;
    const { user, profile, signOut } = useAuth();
    const isAdmin = profile === null || profile === void 0 ? void 0 : profile.is_admin;
    const handleSignOut = async () => {
        await signOut();
        // Optional: Add redirect logic if needed, though signOut might handle it
    };
    if (!user) {
        // Render nothing or a login button if needed in contexts where UserNav might be shown to logged-out users
        return null;
    }
    return (<DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {/* Use profile avatar first, fallback to user metadata, then initial */}
            <AvatarImage src={(profile === null || profile === void 0 ? void 0 : profile.avatar_url) || ((_a = user.user_metadata) === null || _a === void 0 ? void 0 : _a.avatar_url) || ""} alt={(profile === null || profile === void 0 ? void 0 : profile.name) || user.email || 'User'}/>
            <AvatarFallback>{((_b = profile === null || profile === void 0 ? void 0 : profile.name) === null || _b === void 0 ? void 0 : _b.charAt(0).toUpperCase()) || ((_c = user.email) === null || _c === void 0 ? void 0 : _c.charAt(0).toUpperCase()) || 'U'}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{(profile === null || profile === void 0 ? void 0 : profile.name) || user.email}</p>
            {(profile === null || profile === void 0 ? void 0 : profile.name) && <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/trips">
              <Map className="mr-2 h-4 w-4"/>
              <span className="lowercase">my trips</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/itineraries">
              <Map className="mr-2 h-4 w-4"/>
              <span className="lowercase">itineraries</span>
            </Link>
          </DropdownMenuItem>
           <DropdownMenuItem asChild>
            <Link href="/saved">
              <Bookmark className="mr-2 h-4 w-4"/>
              <span className="lowercase">saved items</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGE_ROUTES.SETTINGS}>
              <User className="mr-2 h-4 w-4"/>
              <span className="lowercase">account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={PAGE_ROUTES.CREATE_TRIP}>
              <PlusCircle className="mr-2 h-4 w-4"/>
              <span className="lowercase">new trip</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (<DropdownMenuItem asChild>
              <Link href="/admin/dashboard"> {/* Link to admin dashboard */}
                <Settings className="mr-2 h-4 w-4"/>
                <span className="lowercase">admin panel</span>
              </Link>
            </DropdownMenuItem>)}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive focus:bg-destructive/10">
          <LogOut className="mr-2 h-4 w-4"/>
          <span className="lowercase">Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>);
}
