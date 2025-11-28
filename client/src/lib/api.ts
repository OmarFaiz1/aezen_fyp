export const BASE_URL = "http://localhost:3000";

export async function apiRequest(
    method: string,
    url: string,
    data?: unknown,
): Promise<Response> {
    const token = localStorage.getItem("token");
    const headers: HeadersInit = {
        "Content-Type": "application/json",
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
        // console.log(`[API] Attaching token to ${url}: ${token.substring(0, 10)}...`);
    } else {
        console.warn(`[API] No token found for ${url}`);
    }

    const path = url.startsWith("/api") ? url : `/api${url}`;
    console.log(`[API] Fetching: ${BASE_URL}${path}`);
    const res = await fetch(`${BASE_URL}${path}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
    });

    if (!res.ok) {
        let errorMessage = `API Error: ${res.status}`;
        try {
            const data = await res.json();
            if (data.message) {
                errorMessage = Array.isArray(data.message) ? data.message[0] : data.message;
            }
        } catch (e) {
            const text = await res.text();
            if (text) errorMessage = text;
        }
        throw new Error(errorMessage);
    }

    return res;
}
