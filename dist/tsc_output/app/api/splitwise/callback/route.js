import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { storeSplitwiseCredentials, SplitwiseError } from "@/lib/services/splitwise";
import { PAGE_ROUTES } from "@/utils/constants";
// Splitwise OAuth configuration
const SPLITWISE_CLIENT_ID = process.env.SPLITWISE_CLIENT_ID;
const SPLITWISE_CLIENT_SECRET = process.env.SPLITWISE_CLIENT_SECRET;
const SPLITWISE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/splitwise/callback`;
// Handle callback from Splitwise OAuth flow
export async function GET(request) {
    var _a, _b;
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get("code");
    const error = requestUrl.searchParams.get("error");
    // Get the trip ID from cookie
    const cookieStore = await cookies();
    const tripId = (_a = cookieStore.get("splitwise_trip_id")) === null || _a === void 0 ? void 0 : _a.value;
    // Clear the cookie
    await cookieStore.delete("splitwise_trip_id");
    // Handle errors from Splitwise OAuth page
    if (error) {
        console.error("Splitwise OAuth error:", error);
        const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=splitwise_auth_failed&error_description=${encodeURIComponent(error)}`);
    }
    // Validate authorization code
    if (!code) {
        const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=missing_auth_code`);
    }
    try {
        // Get the authenticated user
        const supabase = createClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
            console.error("Auth error:", authError);
            // Redirect to login, keeping the original trip target if available
            const loginRedirect = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/login?redirect=${encodeURIComponent(loginRedirect)}`);
        }
        // Exchange the authorization code for access token
        const tokenResponse = await fetch("https://secure.splitwise.com/oauth/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                client_id: SPLITWISE_CLIENT_ID,
                client_secret: SPLITWISE_CLIENT_SECRET,
                redirect_uri: SPLITWISE_REDIRECT_URI,
                grant_type: "authorization_code",
                code,
            }),
        });
        const tokenData = await tokenResponse.json(); // Get body regardless of status
        if (!tokenResponse.ok) {
            console.error("Splitwise token exchange error:", tokenResponse.status, tokenData);
            const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=token_exchange_failed&splitwise_error=${encodeURIComponent((tokenData === null || tokenData === void 0 ? void 0 : tokenData.error) || 'Unknown')}`);
        }
        // Validate only the necessary token data initially
        if (!tokenData || typeof tokenData !== 'object' || !tokenData.access_token) {
            console.error("Invalid token data received from Splitwise (missing access_token):", tokenData);
            const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=invalid_token_data`);
        }
        // --- Get Splitwise User ID --- 
        let splitwiseUserId = null;
        try {
            // Use the obtained access token to get current user details from Splitwise
            // Note: getCurrentUser requires modifications to accept token directly
            // For now, we'll directly call fetch here, but ideally getCurrentUser is refactored.
            const currentUserResponse = await fetch("https://secure.splitwise.com/api/v3.0/get_current_user", {
                headers: {
                    "Authorization": `Bearer ${tokenData.access_token}`
                }
            });
            const currentUserData = await currentUserResponse.json();
            if (!currentUserResponse.ok || !((_b = currentUserData === null || currentUserData === void 0 ? void 0 : currentUserData.user) === null || _b === void 0 ? void 0 : _b.id)) {
                console.error("Failed to get Splitwise user ID:", currentUserResponse.status, currentUserData);
                throw new Error("Failed to retrieve Splitwise user details.");
            }
            splitwiseUserId = currentUserData.user.id;
        }
        catch (fetchUserError) {
            console.error("Error fetching Splitwise user ID:", fetchUserError);
            const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=fetch_splitwise_user_failed`);
        }
        // --- End Get Splitwise User ID ---
        // Ensure we actually got the ID before proceeding
        if (splitwiseUserId === null) {
            console.error("Splitwise User ID is null after fetch attempt.");
            const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=fetch_splitwise_user_failed`);
        }
        // Save the tokens to the database
        // Calculate expiry (provide a default if expires_in is missing)
        const expiresInSeconds = typeof tokenData.expires_in === 'number' ? tokenData.expires_in : 3600; // Default to 1 hour
        const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);
        // Handle potentially missing refresh token
        const refreshToken = tokenData.refresh_token || null;
        const success = await storeSplitwiseCredentials(user.id, tokenData.access_token, refreshToken, expiresAt, splitwiseUserId // Use the fetched ID
        );
        if (!success) {
            console.error("Failed to store Splitwise credentials");
            const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=storing_credentials_failed`);
        }
        // Redirect back to the trip page with success message
        const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?splitwiseConnected=true`);
    }
    catch (error) {
        console.error("Error in Splitwise callback:", error);
        const redirectUrl = tripId ? PAGE_ROUTES.TRIP_DETAILS(tripId) : PAGE_ROUTES.TRIPS;
        const errorMessage = (error instanceof SplitwiseError || error instanceof Error) ? error.message : "unexpected_error";
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}${redirectUrl}?error=${encodeURIComponent(errorMessage)}`);
    }
}
