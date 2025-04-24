"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, UserPlus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { AuthSellingPoints } from "@/components/auth-selling-points";
import { createClient } from "@/utils/supabase/client";
export default function SignupPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [signupContext, setSignupContext] = useState(null);
    const supabase = createClient();
    // Get invitation token or referral code from URL
    const invitationToken = searchParams.get("invitation");
    const referralCode = searchParams.get("ref");
    const redirectParam = searchParams.get("redirect");
    // Pre-fill email if coming from invitation
    useEffect(() => {
        if (invitationToken) {
            // Fetch invitation details to get the email
            async function getInvitationDetails() {
                var _a;
                try {
                    const response = await fetch(`/api/invitations/${invitationToken}`);
                    if (response.ok) {
                        const data = await response.json();
                        if ((_a = data.invitation) === null || _a === void 0 ? void 0 : _a.email) {
                            setFormData((prev) => (Object.assign(Object.assign({}, prev), { email: data.invitation.email })));
                        }
                    }
                }
                catch (error) {
                    console.error("Error fetching invitation details:", error);
                }
            }
            getInvitationDetails();
        }
        // Detect where the user is coming from and provide appropriate context
        if (redirectParam) {
            if (redirectParam.includes('/trips/create')) {
                setSignupContext("to create a new trip");
            }
            else if (redirectParam.includes('/trips')) {
                setSignupContext("to access trips");
            }
            else if (redirectParam.includes('/saved')) {
                setSignupContext("to save your favorite places");
            }
        }
    }, [invitationToken, redirectParam]);
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => (Object.assign(Object.assign({}, prev), { [name]: value })));
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        try {
            // Sign up directly using Supabase client
            const { data, error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    // Pass name/username in options.data if needed for profile/metadata
                    // This depends on how your Supabase project/triggers are set up.
                    // If profile is created via API route after confirmation, this might not be needed here.
                    data: {
                        name: formData.name || formData.email.split('@')[0], // Example: Pass name
                    }
                }
            });
            if (signUpError) {
                throw signUpError; // Throw the error to be caught below
            }
            // Check if email confirmation is required
            if (data.user && !data.user.email_confirmed_at) {
                setSuccess(true); // Show success message about checking email
                toast({
                    title: "account created!",
                    description: "please check your email to verify your account.",
                });
            }
            else if (data.user) {
                // User created and possibly auto-confirmed (or confirmation disabled)
                // We might still show the email check message for consistency, 
                // or directly proceed as if logged in (though /api/auth/me handles profile fetch).
                setSuccess(true);
                toast({
                    title: "account created!",
                    description: "signup successful! you may need to verify your email.",
                });
            }
            else {
                // Handle case where sign up returns no user and no error (unlikely but possible)
                throw new Error('Signup completed but no user data received.');
            }
            // Clear form only on success
            setFormData({
                name: "",
                email: "",
                password: "",
            });
            // --- Invitation acceptance can be handled in the callback or after first login ---
            // Removing immediate invitation acceptance here as it requires the user to be logged in,
            // which might not be the case if email verification is needed.
            // The callback route already handles invitations for OAuth sign-ins.
            // For email signups, accepting after first login might be more robust.
        }
        catch (error) {
            console.error("Signup error:", error);
            let errorMessage = "an error occurred during signup";
            if (error.message) {
                if (error.message.includes("User already registered")) {
                    errorMessage = "an account with this email already exists.";
                }
                else if (error.message.includes("Password should be at least 6 characters")) {
                    errorMessage = "password must be at least 6 characters long";
                }
                else {
                    errorMessage = error.message;
                }
            }
            setError(errorMessage);
            toast({
                title: "signup failed",
                description: errorMessage,
                variant: "destructive",
            });
        }
        finally {
            setIsLoading(false);
        }
    };
    async function handleGoogleSignIn() {
        try {
            setIsGoogleLoading(true);
            // Get the redirect URL from search params or default to home
            const redirectUrl = searchParams.get("redirect") || "/";
            // Construct the callback URL base
            const callbackUrl = new URL('/auth/callback', window.location.origin);
            // Append existing search params from the signup page (like redirect, ref, invitation) to the callback
            searchParams.forEach((value, key) => {
                callbackUrl.searchParams.append(key, value);
            });
            // Ensure the intended final redirect is included if not already present
            if (!callbackUrl.searchParams.has('redirect')) {
                callbackUrl.searchParams.set('redirect', redirectUrl);
            }
            console.log("Google Sign-In redirectTo:", callbackUrl.toString()); // For debugging
            // Initiate Google OAuth sign-in using Supabase client
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: callbackUrl.toString(),
                    //queryParams: { // Optional: Add any extra params if needed by Supabase
                    //  invitation: invitationToken || '',
                    //  ref: referralCode || ''
                    //}
                },
            });
            if (error) {
                throw error; // Throw error to be caught below
            }
            // Note: No need to handle redirect here, Supabase handles it.
        }
        catch (error) {
            console.error('Google sign-in error:', error);
            toast({
                title: 'Google sign-in failed',
                description: error.message || 'Please try again later.',
                variant: 'destructive',
            });
            setIsGoogleLoading(false); // Ensure loading state is reset on error
        }
        // No finally block needed here, loading state reset on error
    }
    return (<div className="flex min-h-screen items-center justify-center bg-gradient-1 dark:bg-gradient-to-r dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-0">
      <div className="w-full max-w-lg">
        <Card className="border-0 shadow-lg mb-8">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold text-center">create an account</CardTitle>
          <CardDescription className="text-center">
            {invitationToken ? ("join withme.travel and accept your trip invitation") : signupContext ? (<>join withme.travel {signupContext}</>) : ("join withme.travel and start planning adventures with friends")}
          </CardDescription>
        </CardHeader>

        {success ? (<CardContent className="space-y-4">
            <Alert>
              <AlertDescription>
                <p className="font-medium">account created successfully!</p>
                <p className="mt-2">
                  we've sent a verification email to <span className="font-medium">{formData.email}</span>. please check
                  your inbox and click the verification link to activate your account.
                </p>
              </AlertDescription>
            </Alert>
            <div className="flex flex-col space-y-2 mt-4">
              <Button asChild>
                <Link href="/login">go to login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">back to home</Link>
              </Button>
            </div>
          </CardContent>) : (<>
            <CardContent className="space-y-4">
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}

              <Button type="button" variant="outline" className="w-full flex items-center gap-2 h-10" onClick={handleGoogleSignIn} disabled={isGoogleLoading}>
                {isGoogleLoading ? (<RefreshCw className="h-4 w-4 animate-spin"/>) : (<svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
                    <g transform="matrix(1, 0, 0, 1, 0, 0)">
                      <path d="M21.35,11.1H12v3.73h5.41c-0.5,2.43-2.73,4.17-5.41,4.17c-3.3,0-6-2.7-6-6s2.7-6,6-6c1.56,0,2.98,0.6,4.07,1.58L20.07,5c-1.97-1.84-4.58-2.96-7.43-2.96c-5.52,0-10,4.48-10,10s4.48,10,10,10c5.67,0,9.4-4.01,9.4-9.65c0-0.58-0.05-1.15-0.15-1.71C21.8,11.58,21.35,11.1,21.35,11.1z" fill="#4285F4"></path>
                    </g>
                  </svg>)}
                {isGoogleLoading ? "Signing in..." : "Sign up with Google"}
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t"/>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">first name</Label>
                    <Input id="name" name="name" placeholder="your name" required value={formData.name} onChange={handleChange}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">email</Label>
                    <Input id="email" name="email" type="email" placeholder="hello@example.com" required value={formData.email} onChange={handleChange} readOnly={Boolean(invitationToken && formData.email !== "")}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">create password</Label>
                    <div className="relative">
                      <Input id="password" name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required minLength={6} value={formData.password} onChange={handleChange}/>
                      <Button type="button" variant="ghost" size="icon" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">at least 6 characters</p>
                  </div>
                  <Button type="submit" className="w-full gap-1" disabled={isLoading}>
                    {isLoading ? ("creating account...") : (<>
                        <UserPlus className="h-4 w-4"/>
                        create account
                      </>)}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-center text-sm text-muted-foreground w-full">
                already have an account?{" "}
                <Link href="/login" className="text-primary hover:underline">
                  sign in
                </Link>
              </p>
            </CardFooter>
          </>)}
      </Card>
        
        {/* Add selling points */}
        <AuthSellingPoints />
      </div>
    </div>);
}
