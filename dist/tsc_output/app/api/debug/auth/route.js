import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function GET() {
    var _a, _b;
    try {
        const supabase = createClient();
        // Get session info
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        // Get user info
        const { data: userData, error: userError } = await supabase.auth.getUser();
        if (sessionError) {
            return NextResponse.json({
                status: "error",
                source: "session",
                message: sessionError.message,
                details: sessionError
            }, { status: 500 });
        }
        if (userError) {
            return NextResponse.json({
                status: "error",
                source: "user",
                message: userError.message,
                details: userError
            }, { status: 500 });
        }
        // Return debugging information
        return NextResponse.json({
            status: "success",
            authenticated: !!userData.user,
            session: {
                exists: !!sessionData.session,
                expires_at: (_a = sessionData.session) === null || _a === void 0 ? void 0 : _a.expires_at,
            },
            user: userData.user ? {
                id: userData.user.id,
                email: userData.user.email,
                provider: (_b = userData.user.app_metadata) === null || _b === void 0 ? void 0 : _b.provider,
                created_at: userData.user.created_at,
            } : null,
        });
    }
    catch (error) {
        console.error("Auth debug error:", error);
        return NextResponse.json({
            status: "error",
            message: error.message || "Unknown error",
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        }, { status: 500 });
    }
}
