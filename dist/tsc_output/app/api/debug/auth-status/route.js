import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
export async function GET() {
    var _a;
    try {
        console.log("[Debug] Checking auth status");
        const supabase = createClient();
        // Check session status
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        // Check user status
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        // Get additional user data if available
        let userData = null;
        if (user) {
            const { data: profile, error: profileError } = await supabase
                .from('users')
                .select('*')
                .eq('id', user.id)
                .single();
            if (!profileError) {
                userData = profile;
            }
        }
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV,
            auth_status: {
                has_session: !!session,
                session_error: sessionError === null || sessionError === void 0 ? void 0 : sessionError.message,
                has_user: !!user,
                user_error: userError === null || userError === void 0 ? void 0 : userError.message,
                user_id: user === null || user === void 0 ? void 0 : user.id,
                user_email: user === null || user === void 0 ? void 0 : user.email,
                user_metadata: user === null || user === void 0 ? void 0 : user.user_metadata,
                auth_provider: (_a = user === null || user === void 0 ? void 0 : user.app_metadata) === null || _a === void 0 ? void 0 : _a.provider,
                last_sign_in: user === null || user === void 0 ? void 0 : user.last_sign_in_at,
            },
            user_data: userData,
        });
    }
    catch (error) {
        console.error("[Debug] Auth status check error:", error);
        return NextResponse.json({
            error: "Failed to check auth status",
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
