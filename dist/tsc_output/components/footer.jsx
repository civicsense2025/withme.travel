"use client";
import Link from "next/link";
import { useAuth } from "./auth-provider";
import { Logo } from "@/components/logo";
export function Footer() {
    const { user, profile } = useAuth();
    const isAdmin = profile === null || profile === void 0 ? void 0 : profile.is_admin;
    // Major continents for the footer links
    const continents = [
        "Africa",
        "Asia",
        "Europe",
        "North America",
        "South America",
        "Oceania"
    ];
    return (<footer className="bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10">
          <div className="space-y-4">
            <Logo />
            <p className="text-sm text-muted-foreground max-w-xs">
              Plan trips with friends without the chaos. Make group travel fun again.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base lowercase">Explore</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/destinations" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/itineraries" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Itineraries
                </Link>
              </li>
              <li>
                <Link href="/trips/create" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Plan a Trip
                </Link>
              </li>
              {user && (<li>
                  <Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                    My Trips
                  </Link>
                </li>)}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base lowercase">Continents</h3>
            <ul className="space-y-3">
              {continents.map((continent) => (<li key={continent}>
                  <Link href={`/continents/${continent.toLowerCase().replace(/\s+/g, "-")}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                    {continent.toLowerCase()}
                  </Link>
                </li>))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base lowercase">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/support" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Support Us
                </Link>
              </li>
              {isAdmin && (<li>
                  <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                    Admin
                  </Link>
                </li>)}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-base lowercase">Legal</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors lowercase">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground lowercase">
            © {new Date().getFullYear()} withme.travel. all rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com/withmetravel" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Twitter</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
              </svg>
            </Link>
            <Link href="https://instagram.com/withmetravel" className="text-muted-foreground hover:text-foreground transition-colors">
              <span className="sr-only">Instagram</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </footer>);
}
