import { NextResponse } from "next/server";
import { cookies } from "next/headers";
// Splitwise OAuth configuration
const SPLITWISE_CLIENT_ID = process.env.SPLITWISE_CLIENT_ID;
const SPLITWISE_CLIENT_SECRET = process.env.SPLITWISE_CLIENT_SECRET;
const SPLITWISE_REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL}/api/splitwise/callback`;
// Start OAuth flow by redirecting to Splitwise authorization page
export async function GET(request) {
    const requestUrl = new URL(request.url);
    const tripId = requestUrl.searchParams.get("trip_id");
    // Store the trip ID in a cookie to retrieve it later in the callback
    if (tripId) {
        const cookieStore = await cookies();
        cookieStore.set("splitwise_trip_id", tripId, {
            maxAge: 3600, // 1 hour
            path: "/",
            secure: process.env.NODE_ENV === "production",
            httpOnly: true,
            sameSite: "lax",
        });
    }
    // Generate the Splitwise OAuth URL
    const authUrl = new URL("https://secure.splitwise.com/oauth/authorize");
    authUrl.searchParams.append("client_id", SPLITWISE_CLIENT_ID);
    authUrl.searchParams.append("redirect_uri", SPLITWISE_REDIRECT_URI);
    authUrl.searchParams.append("response_type", "code");
    authUrl.searchParams.append("scope", "default");
    // Redirect the user to the Splitwise authorization page
    return NextResponse.redirect(authUrl.toString());
}
// Exchange authorization code for access token
export async function POST(request) {
    try {
        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ error: "Authorization code is required" }, { status: 400 });
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
        if (!tokenResponse.ok) {
            const errorData = await tokenResponse.json();
            console.error("Splitwise token exchange error:", errorData);
            return NextResponse.json({ error: "Failed to exchange authorization code for access token" }, { status: 400 });
        }
        const tokenData = await tokenResponse.json();
        // Return the tokens and Splitwise user ID
        return NextResponse.json({
            access_token: tokenData.access_token,
            refresh_token: tokenData.refresh_token,
            expires_in: tokenData.expires_in,
            user_id: tokenData.user_id,
        });
    }
    catch (error) {
        console.error("Error in Splitwise auth POST handler:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
