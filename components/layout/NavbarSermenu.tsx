import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/lib/hooks/use-auth';
import Link from 'next/link';

export function NavbarUserMenu() {
  const { user, logout } = useAuth();
  
  if (!user) {
    return null;
  }
  
  // Extract user initials for avatar fallback
  const userInitials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
    : 'U';
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user?.user_metadata?.avatar_url || undefined}
              alt={user?.user_metadata?.full_name || 'User'}
            />
            <AvatarFallback className="text-base">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="py-3 text-base">
          {user?.user_metadata?.full_name || user?.email || 'User'}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/trips/manage">My Trips</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/groups/manage">My Groups</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/settings">Account Settings</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/travel-map">Travel Map</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="py-3 cursor-pointer">
          <Link href="/saved">Saved</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="py-3 text-rose-500 dark:text-rose-400 cursor-pointer"
          onClick={() => logout()}
        >
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
