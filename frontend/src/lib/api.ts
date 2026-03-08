const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

interface FetchOptions extends RequestInit {
    token?: string;
}

async function fetchAPI(endpoint: string, options: FetchOptions = {}) {
    const { token, ...fetchOpts } = options;

    const headers: Record<string, string> = {
        ...((fetchOpts.headers as Record<string, string>) || {}),
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    // Only set Content-Type for non-FormData bodies
    if (!(fetchOpts.body instanceof FormData)) {
        headers["Content-Type"] = "application/json";
    }

    const res = await fetch(`${API_BASE}${endpoint}`, {
        ...fetchOpts,
        headers,
    });

    if (!res.ok) {
        const error = await res.json().catch(() => ({ detail: "Request failed" }));
        throw new Error(error.detail || `HTTP ${res.status}`);
    }

    return res.json();
}

// Auth
export const authAPI = {
    register: (data: { email: string; name: string; password: string }) =>
        fetchAPI("/auth/register", { method: "POST", body: JSON.stringify(data) }),

    login: (data: { email: string; password: string }) =>
        fetchAPI("/auth/login", { method: "POST", body: JSON.stringify(data) }),

    getMe: (token: string) => fetchAPI("/auth/me", { token }),
};

// Interviews
export const interviewAPI = {
    create: (token: string, data: {
        job_title: string;
        job_description?: string;
        self_introduction?: string;
        difficulty?: string;
        duration_minutes?: number;
    }) =>
        fetchAPI("/interviews/", { method: "POST", body: JSON.stringify(data), token }),

    list: (token: string) =>
        fetchAPI("/interviews/", { token }),

    get: (token: string, id: string) =>
        fetchAPI(`/interviews/${id}`, { token }),

    uploadResume: (token: string, interviewId: string, file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return fetchAPI(`/interviews/${interviewId}/upload-resume`, {
            method: "POST",
            body: formData,
            token,
        });
    },

    start: (token: string, id: string) =>
        fetchAPI(`/interviews/${id}/start`, { method: "POST", token }),

    sendMessage: (token: string, id: string, content: string) =>
        fetchAPI(`/interviews/${id}/message`, {
            method: "POST",
            body: JSON.stringify({ content }),
            token,
        }),

    end: (token: string, id: string) =>
        fetchAPI(`/interviews/${id}/end`, { method: "POST", token }),
};
