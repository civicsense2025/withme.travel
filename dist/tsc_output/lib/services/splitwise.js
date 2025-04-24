// Splitwise API integration service
// Based on Splitwise API documentation (https://dev.splitwise.com/)
import { createClient } from "@/utils/supabase/server";
import { DB_TABLES, DB_FIELDS } from "@/utils/constants";
const SPLITWISE_API_BASE = "https://secure.splitwise.com/api/v3.0";
export class SplitwiseError extends Error {
    constructor(message, statusCode = 500, originalError) {
        super(message);
        this.statusCode = statusCode;
        this.originalError = originalError;
        this.name = 'SplitwiseError';
    }
}
// Fetches access token and credentials from the database for a user
export async function getSplitwiseCredentials(userId) {
    const supabase = createClient();
    const { data, error } = await supabase
        .from(DB_TABLES.SPLITWISE_CONNECTIONS)
        .select("*")
        .eq(DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID, userId);
    // Remove .single() to allow zero rows without error
    // .single(); 
    if (error) {
        console.error("Supabase error fetching Splitwise credentials for user:", userId, error);
        throw new SplitwiseError('Failed to fetch Splitwise credentials', 500, error);
    }
    // Check if data is an array and take the first element if it exists
    const connectionData = Array.isArray(data) ? data[0] : data;
    if (!connectionData) {
        // User hasn't connected Splitwise yet - this is expected in some cases
        console.log(`Splitwise not connected for user: ${userId}`);
        throw new SplitwiseError('Splitwise not connected', 401);
    }
    return connectionData;
}
// Store Splitwise credentials in the database
export async function storeSplitwiseCredentials(userId, accessToken, refreshToken, expiresAt, splitwiseUserId) {
    const supabase = createClient();
    // Validate expiresAt before using it
    if (!(expiresAt instanceof Date) || isNaN(expiresAt.getTime())) {
        console.error("Invalid expiresAt date provided to storeSplitwiseCredentials:", expiresAt);
        throw new SplitwiseError('Invalid expiration date provided for Splitwise credentials', 400);
    }
    // Check if a record already exists for this user
    const { data: existingConnection, error: fetchError } = await supabase
        .from(DB_TABLES.SPLITWISE_CONNECTIONS)
        .select(DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID)
        .eq(DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID, userId)
        .maybeSingle(); // Use maybeSingle to avoid error if not found
    if (fetchError) {
        console.error("Supabase error checking existing Splitwise connection:", userId, fetchError);
        throw new SplitwiseError('Failed to check for existing Splitwise connection', 500, fetchError);
    }
    // Prepare data for upsert
    const upsertData = {
        [DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID]: userId,
        [DB_FIELDS.SPLITWISE_CONNECTIONS.ACCESS_TOKEN]: accessToken,
        [DB_FIELDS.SPLITWISE_CONNECTIONS.EXPIRES_AT]: expiresAt.toISOString(),
        [DB_FIELDS.SPLITWISE_CONNECTIONS.SPLITWISE_USER_ID]: splitwiseUserId,
        [DB_FIELDS.SPLITWISE_CONNECTIONS.UPDATED_AT]: new Date().toISOString(),
        // Add created_at on initial insert (Supabase handles this implicitly with upsert, but being explicit is fine)
        // If it's an update, this will be ignored due to onConflict
        [DB_FIELDS.SPLITWISE_CONNECTIONS.CREATED_AT]: existingConnection ? undefined : new Date().toISOString(),
    };
    // Only include refresh_token if it's provided (don't overwrite existing with null on update)
    if (refreshToken) {
        upsertData[DB_FIELDS.SPLITWISE_CONNECTIONS.REFRESH_TOKEN] = refreshToken;
    }
    // Remove undefined created_at if updating
    if (!upsertData[DB_FIELDS.SPLITWISE_CONNECTIONS.CREATED_AT]) {
        delete upsertData[DB_FIELDS.SPLITWISE_CONNECTIONS.CREATED_AT];
    }
    // Perform the upsert
    const { error: upsertError } = await supabase
        .from(DB_TABLES.SPLITWISE_CONNECTIONS)
        .upsert(upsertData, {
        onConflict: DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID
    });
    if (upsertError) {
        console.error("Supabase error storing Splitwise credentials for user:", userId, upsertError); // Keep detailed logging
        throw new SplitwiseError('Failed to store Splitwise credentials', 500, upsertError);
    }
    return true;
}
// Delete Splitwise connection
export async function disconnectSplitwise(userId) {
    const supabase = createClient();
    const { error } = await supabase
        .from(DB_TABLES.SPLITWISE_CONNECTIONS)
        .delete()
        .eq(DB_FIELDS.SPLITWISE_CONNECTIONS.USER_ID, userId);
    if (error) {
        throw new SplitwiseError('Failed to disconnect Splitwise', 500, error);
    }
    return true;
}
// Link a trip to a Splitwise group
export async function linkTripToSplitwiseGroup(tripId, splitwiseGroupId) {
    const supabase = createClient();
    const { error } = await supabase
        .from(DB_TABLES.TRIPS)
        .update({
        [DB_FIELDS.TRIPS.SPLITWISE_GROUP_ID]: splitwiseGroupId,
        [DB_FIELDS.TRIPS.UPDATED_AT]: new Date().toISOString(),
    })
        .eq(DB_FIELDS.TRIPS.ID, tripId);
    if (error) {
        throw new SplitwiseError('Failed to link trip to Splitwise group', 500, error);
    }
    return true;
}
// Add constants needed for refresh
const SPLITWISE_CLIENT_ID = process.env.SPLITWISE_CLIENT_ID;
const SPLITWISE_CLIENT_SECRET = process.env.SPLITWISE_CLIENT_SECRET;
const SPLITWISE_TOKEN_URL = "https://secure.splitwise.com/oauth/token";
// Refresh access token if expired
async function refreshAccessToken(userId, refreshToken) {
    console.log("Attempting to refresh Splitwise token for user:", userId);
    try {
        // Prepare form data for the request
        const formData = new URLSearchParams();
        formData.append('grant_type', 'refresh_token');
        formData.append('client_id', SPLITWISE_CLIENT_ID);
        formData.append('client_secret', SPLITWISE_CLIENT_SECRET);
        formData.append('refresh_token', refreshToken);
        // Call Splitwise token endpoint directly
        const response = await fetch(SPLITWISE_TOKEN_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded", // Use URL-encoded form data
            },
            body: formData.toString(), // Send as URL-encoded string
        });
        if (!response.ok) {
            // Log specific error from Splitwise if possible
            let errorBody = {};
            try {
                errorBody = await response.json();
            }
            catch (e) { /* ignore if not json */ }
            console.error("Splitwise token refresh failed:", response.status, response.statusText, errorBody);
            throw new SplitwiseError(`Failed to refresh Splitwise token: ${response.status} ${response.statusText}`, response.status, errorBody);
        }
        const data = await response.json();
        // Validate received data
        if (!data.access_token || !data.expires_in) {
            console.error("Invalid data received from Splitwise token refresh:", data);
            throw new SplitwiseError("Invalid data received from Splitwise token refresh", 500, data);
        }
        // Calculate new expiry date
        const expiresAt = new Date(Date.now() + data.expires_in * 1000);
        const newRefreshToken = data.refresh_token || refreshToken; // Use new refresh token if provided
        // Need splitwise_user_id, but refresh endpoint doesn't return it. 
        // We should fetch it separately or store it initially.
        // For now, we fetch existing credentials to get it.
        const currentCredentials = await getSplitwiseCredentials(userId);
        const splitwiseUserId = currentCredentials.splitwise_user_id;
        if (!splitwiseUserId) {
            console.error("Could not retrieve splitwise_user_id for token refresh update.");
            throw new SplitwiseError("Missing Splitwise User ID for token update", 500);
        }
        // Update stored credentials with new tokens
        console.log("Storing refreshed Splitwise credentials for user:", userId);
        await storeSplitwiseCredentials(userId, data.access_token, newRefreshToken, expiresAt, splitwiseUserId // Use existing ID
        );
        console.log("Splitwise token refreshed successfully for user:", userId);
        return data.access_token;
    }
    catch (error) {
        // Log the error before re-throwing or handling
        console.error("Error during Splitwise token refresh process:", error);
        if (error instanceof SplitwiseError) {
            // Re-throw known Splitwise errors
            throw error;
        }
        else if (error instanceof Error) {
            // Wrap unknown errors
            throw new SplitwiseError(`Failed to refresh Splitwise token: ${error.message}`, 500, error);
        }
        else {
            // Handle non-Error objects thrown
            throw new SplitwiseError('An unexpected error occurred during token refresh', 500, error);
        }
    }
}
// Centralized function to make authenticated requests to Splitwise API
async function makeSplitwiseRequest(userId, endpoint, method = "GET", body) {
    let credentials = await getSplitwiseCredentials(userId);
    // Check if token is expired or near expiry (e.g., within 60 seconds)
    const now = new Date();
    const expiresAt = new Date(credentials.expires_at);
    const bufferSeconds = 60; // Refresh if token expires within the next 60 seconds
    if (now.getTime() >= expiresAt.getTime() - bufferSeconds * 1000) {
        console.log(`Splitwise token for user ${userId} expired or near expiry. Refreshing...`);
        if (!credentials.refresh_token) {
            console.error(`Splitwise token expired for user ${userId}, but no refresh token available.`);
            // Optionally attempt to clear the expired token here or just throw
            await disconnectSplitwise(userId).catch(err => console.error("Failed to disconnect Splitwise after expired token without refresh:", err));
            throw new SplitwiseError("Splitwise token expired, and no refresh token found. Please reconnect.", 401);
        }
        try {
            // refreshAccessToken internally updates the stored credentials
            const newAccessToken = await refreshAccessToken(userId, credentials.refresh_token);
            // Use the new access token for this request
            credentials.access_token = newAccessToken;
            console.log(`Splitwise token refreshed successfully for user ${userId}.`);
        }
        catch (refreshError) {
            console.error(`Failed to refresh Splitwise token for user ${userId}:`, refreshError);
            // If refresh fails (e.g., invalid refresh token), disconnect and throw
            await disconnectSplitwise(userId).catch(err => console.error("Failed to disconnect Splitwise after failed refresh:", err));
            throw new SplitwiseError("Failed to refresh Splitwise token. Please reconnect.", 401, refreshError);
        }
    }
    const url = `${SPLITWISE_API_BASE}${endpoint}`;
    const headers = {
        Authorization: `Bearer ${credentials.access_token}`,
        "Content-Type": "application/json",
    };
    const options = {
        method,
        headers,
    };
    if (body && (method === "POST" || method === "PUT" || method === "PATCH")) {
        options.body = JSON.stringify(body);
    }
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            let errorBody = { message: `Splitwise API Error: ${response.status} ${response.statusText}` };
            try {
                errorBody = await response.json();
                // Add status to the error body if it's not already there
                if (!errorBody.status)
                    errorBody.status = response.status;
            }
            catch (e) { /* Ignore if body isn't valid JSON */ }
            console.error(`Splitwise API request failed for user ${userId} to ${endpoint}:`, response.status, errorBody);
            // Handle specific 401 Unauthorized from Splitwise (e.g., token revoked)
            if (response.status === 401) {
                console.warn(`Received 401 from Splitwise for user ${userId}. Disconnecting.`);
                await disconnectSplitwise(userId).catch(err => console.error("Failed to disconnect Splitwise after API 401:", err));
                throw new SplitwiseError("Splitwise access denied. Please reconnect.", 401, errorBody);
            }
            // Throw a generic error with status code and potential details from Splitwise
            throw new SplitwiseError((errorBody === null || errorBody === void 0 ? void 0 : errorBody.error) || (errorBody === null || errorBody === void 0 ? void 0 : errorBody.message) || `Splitwise API Error: ${response.status}`, response.status, errorBody);
        }
        // Handle cases where the response might be empty (e.g., 204 No Content)
        if (response.status === 204) {
            return {}; // Return an empty object or appropriate type
        }
        // Assume JSON response for other successful statuses
        return await response.json();
    }
    catch (error) {
        // Catch network errors or errors thrown from response handling
        console.error(`Network or parsing error during Splitwise request for user ${userId} to ${endpoint}:`, error);
        if (error instanceof SplitwiseError) {
            // Re-throw specific Splitwise errors
            throw error;
        }
        // Throw a generic error for other issues
        throw new SplitwiseError("Failed to communicate with Splitwise API", 503, error);
    }
}
// Get current user info from Splitwise
export async function getCurrentUser(userId) {
    return makeSplitwiseRequest(userId, "/get_current_user");
}
// Get all groups for the current user
export async function getGroups(userId) {
    return makeSplitwiseRequest(userId, "/get_groups");
}
// Get a specific group
export async function getGroup(userId, groupId) {
    return makeSplitwiseRequest(userId, `/get_group/${groupId}`);
}
// Get expenses for a group
export async function getGroupExpenses(userId, groupId, limit = 100) {
    return makeSplitwiseRequest(userId, `/get_expenses?group_id=${groupId}&limit=${limit}`);
}
// Create an expense in a group
export async function createExpense(userId, groupId, description, cost, currencyCode = "USD", splitEqually = true, date = new Date().toISOString().split('T')[0], categoryId, users) {
    const body = {
        group_id: groupId,
        description,
        cost,
        currency_code: currencyCode,
        date,
    };
    if (categoryId) {
        body.category_id = categoryId;
    }
    if (!splitEqually && users) {
        body.split_equally = false;
        body.users = users;
    }
    return makeSplitwiseRequest(userId, "/create_expense", "POST", body);
}
// Get friends list
export async function getFriends(userId) {
    const response = await makeSplitwiseRequest(userId, "/get_friends");
    return response.friends;
}
// Get supported currencies
export async function getSupportedCurrencies(userId) {
    return makeSplitwiseRequest(userId, "/get_currencies");
}
// Get supported categories
export async function getSupportedCategories(userId) {
    return makeSplitwiseRequest(userId, "/get_categories");
}
