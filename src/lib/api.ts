import type { AuthResponse, Message, UserProfile } from './types';

const TOKEN_KEY = 'sema_token';

// --- Token Management ---
export function getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
}

// --- Fetch Helper ---
async function apiFetch<T>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
        ...options,
        headers,
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
    }

    return data as T;
}

// --- Auth API ---
export async function register(
    username: string,
    email: string,
    displayName: string,
    password: string
): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, email, displayName, password }),
    });
    setToken(data.token);
    return data;
}

export async function login(
    username: string,
    password: string
): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
    setToken(data.token);
    return data;
}

export async function fetchMe(): Promise<UserProfile | null> {
    const token = getToken();
    if (!token) return null;
    try {
        const data = await apiFetch<{ user: UserProfile }>('/api/auth/me');
        return data.user;
    } catch {
        removeToken();
        return null;
    }
}

export function logout(): void {
    removeToken();
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<{ message: string }> {
    return apiFetch('/api/auth/change-password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
    });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
    return apiFetch('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
}

export async function resetPassword(
    token: string,
    password: string
): Promise<{ message: string }> {
    return apiFetch('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, password }),
    });
}

// --- Profile API ---
export async function fetchProfile(username: string): Promise<UserProfile | null> {
    try {
        const data = await apiFetch<UserProfile>(`/api/profile/${username.toLowerCase()}`);
        return data;
    } catch {
        return null;
    }
}

export async function updatePrompt(prompt: string): Promise<UserProfile> {
    const data = await apiFetch<{ user: UserProfile }>('/api/profile/prompt', {
        method: 'PUT',
        body: JSON.stringify({ prompt }),
    });
    return data.user;
}

export async function toggleExpiringMode(enabled: boolean): Promise<UserProfile> {
    const data = await apiFetch<{ user: UserProfile }>('/api/profile/expiring-mode', {
        method: 'PUT',
        body: JSON.stringify({ enabled }),
    });
    return data.user;
}

// --- Messages API ---
export async function sendMessage(
    recipientUsername: string,
    content: string,
    prompt: string
): Promise<void> {
    await apiFetch('/api/messages/' + recipientUsername.toLowerCase(), {
        method: 'POST',
        body: JSON.stringify({ content, prompt }),
    });
}

export async function fetchInbox(): Promise<Message[]> {
    const data = await apiFetch<{ messages: Message[] }>('/api/messages/inbox');
    return data.messages;
}

export async function getUnreadCount(): Promise<number> {
    const data = await apiFetch<{ count: number }>('/api/messages/unread-count');
    return data.count;
}

export async function markAsRead(messageId: string): Promise<void> {
    await apiFetch(`/api/messages/${messageId}/read`, { method: 'PATCH' });
}

export async function toggleFavorite(messageId: string): Promise<Message> {
    const data = await apiFetch<{ message: Message }>(
        `/api/messages/${messageId}/favorite`,
        { method: 'PATCH' }
    );
    return data.message;
}

export async function deleteMessage(messageId: string): Promise<void> {
    await apiFetch(`/api/messages/${messageId}`, { method: 'DELETE' });
}
