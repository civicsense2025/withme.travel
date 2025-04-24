import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
// Helper function to check admin status (can be moved to a shared lib later)
async function isAdmin(supabaseClient) {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
        return false;
    }
    const { data: profile, error } = await supabaseClient
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
    if (error || !profile) {
        console.error('[API Admin Check] Error fetching profile or profile not found:', error);
        return false;
    }
    return profile.is_admin === true;
}
export async function PUT(request, { params }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            async get(name) {
                var _a;
                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            async set(name, value, options) {
                try {
                    const cookieStore = await cookies();
                    cookieStore.set(Object.assign({ name, value }, options));
                }
                catch (error) {
                    // Handle error if needed
                }
            },
            async remove(name, options) {
                try {
                    const cookieStore = await cookies();
                    cookieStore.delete(Object.assign({ name }, options));
                }
                catch (error) {
                    // Handle error if needed
                }
            },
        },
    });
    // Check if the user is an admin
    const userIsAdmin = await isAdmin(supabase);
    if (!userIsAdmin) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    try {
        const { id } = params;
        const data = await request.json();
        const { error } = await supabase
            .from('destinations')
            .update(data)
            .eq('id', id);
        if (error)
            throw error;
        return NextResponse.json({ message: 'Destination updated successfully' });
    }
    catch (error) {
        console.error('Error updating destination:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to update destination', details: error.message }), { status: 500 });
    }
}
export async function DELETE(request, { params }) {
    const cookieStore = await cookies();
    const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            async get(name) {
                var _a;
                return (_a = cookieStore.get(name)) === null || _a === void 0 ? void 0 : _a.value;
            },
            async set(name, value, options) {
                try {
                    const cookieStore = await cookies();
                    cookieStore.set(Object.assign({ name, value }, options));
                }
                catch (error) {
                    // Handle error if needed
                }
            },
            async remove(name, options) {
                try {
                    const cookieStore = await cookies();
                    cookieStore.delete(Object.assign({ name }, options));
                }
                catch (error) {
                    // Handle error if needed
                }
            },
        },
    });
    // Check if the user is an admin
    const userIsAdmin = await isAdmin(supabase);
    if (!userIsAdmin) {
        return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    try {
        const { id } = params;
        const { error } = await supabase.from('destinations').delete().eq('id', id);
        if (error)
            throw error;
        return NextResponse.json({ message: 'Destination deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting destination:', error);
        return new NextResponse(JSON.stringify({ error: 'Failed to delete destination', details: error.message }), { status: 500 });
    }
}
