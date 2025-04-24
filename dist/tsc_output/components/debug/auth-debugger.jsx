"use client";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
export function AuthDebugger() {
    const { user, session, isLoading, supabase } = useAuth();
    const [errors, setErrors] = useState([]);
    const [cookieInfo, setCookieInfo] = useState({});
    // Check session and cookies
    useEffect(() => {
        if (!supabase)
            return;
        const checkAuth = async () => {
            try {
                // Get current session state using the client from context
                const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
                if (sessionError) {
                    addError("Session check failed", sessionError.message);
                }
                // Parse and check auth cookies
                const cookies = document.cookie.split(';').reduce((acc, cookie) => {
                    const [key, value] = cookie.trim().split('=');
                    if (key.startsWith('sb-') || key.includes('auth')) {
                        acc[key] = value;
                    }
                    return acc;
                }, {});
                setCookieInfo(cookies);
                // Validate session matches cookies
                if (currentSession && Object.keys(cookies).length === 0) {
                    addError("Cookie mismatch", "Session exists but no auth cookies found");
                }
                if (!currentSession && Object.keys(cookies).length > 0) {
                    addError("Cookie mismatch", "Auth cookies exist but no session found");
                }
            }
            catch (error) {
                addError("Auth check failed", error instanceof Error ? error.message : "Unknown error");
            }
        };
        checkAuth();
        // Set up auth state change listener using the client from context
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            addError("Auth state changed", `Event: ${event}`, "info");
        });
        return () => {
            subscription === null || subscription === void 0 ? void 0 : subscription.unsubscribe();
        };
    }, [supabase]);
    const addError = (context, error, type = "error") => {
        setErrors(prev => [{
                timestamp: new Date().toISOString(),
                error: error,
                context: context
            }, ...prev].slice(0, 50)); // Keep last 50 errors
    };
    return (<Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Auth Debugger
          <Badge variant={isLoading ? "outline" : session ? "secondary" : "destructive"}>
            {isLoading ? "Loading..." : session ? "Authenticated" : "Not Authenticated"}
          </Badge>
        </CardTitle>
        <CardDescription>
          Debug authentication state and issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Info */}
        <div className="space-y-2">
          <h3 className="font-medium">User Info</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        {/* Session Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Session Info</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(session, null, 2)}
          </pre>
        </div>

        {/* Cookie Info */}
        <div className="space-y-2">
          <h3 className="font-medium">Auth Cookies</h3>
          <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
            {JSON.stringify(cookieInfo, null, 2)}
          </pre>
        </div>

        {/* Error Log */}
        <div className="space-y-2">
          <h3 className="font-medium">Recent Auth Events & Errors</h3>
          <ScrollArea className="h-[200px] w-full rounded-md border">
            <div className="p-4 space-y-3">
              {errors.map((error, i) => {
            var _a;
            return (<div key={i} className="text-sm space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={((_a = error.context) === null || _a === void 0 ? void 0 : _a.includes("info")) ? "outline" : "destructive"} className="h-5">
                      {new Date(error.timestamp).toLocaleTimeString()}
                    </Badge>
                    <span className="font-medium">{error.context}</span>
                  </div>
                  <p className="text-muted-foreground pl-[76px]">{error.error}</p>
                </div>);
        })}
              {errors.length === 0 && (<p className="text-muted-foreground text-sm">No auth events recorded yet</p>)}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>);
}
