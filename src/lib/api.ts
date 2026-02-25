import { generateId, type Message, type UserProfile } from './types';

const PROFILES_KEY = 'sema_profiles';
const MESSAGES_KEY = 'sema_messages';
const CURRENT_USER_KEY = 'sema_current_user';

// --- Helpers ---
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function getProfiles(): Record<string, UserProfile> {
    const stored = localStorage.getItem(PROFILES_KEY);
    return stored ? JSON.parse(stored) : {};
}

function saveProfiles(profiles: Record<string, UserProfile>): void {
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

function getMessages(): Message[] {
    const stored = localStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveMessages(messages: Message[]): void {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

// --- Current User ---
export function getCurrentUser(): string | null {
    return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUser(username: string): void {
    localStorage.setItem(CURRENT_USER_KEY, username);
}

export function logoutUser(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
}

// --- Profile API ---
export async function createProfile(username: string, displayName: string): Promise<UserProfile> {
    await delay(300);
    const profiles = getProfiles();

    const normalizedUsername = username.toLowerCase().trim();

    if (profiles[normalizedUsername]) {
        throw new Error('Username already taken');
    }

    if (!/^[a-z0-9_]{3,20}$/.test(normalizedUsername)) {
        throw new Error('Username must be 3-20 chars, lowercase letters, numbers, and underscores only');
    }

    const profile: UserProfile = {
        username: normalizedUsername,
        displayName: displayName.trim() || normalizedUsername,
        activePrompt: 'send me anonymous messages 👀',
        createdAt: new Date().toISOString(),
        messageCount: 0,
    };

    profiles[normalizedUsername] = profile;
    saveProfiles(profiles);
    setCurrentUser(normalizedUsername);
    return profile;
}

export async function fetchProfile(username: string): Promise<UserProfile | null> {
    await delay(200);
    const profiles = getProfiles();
    return profiles[username.toLowerCase()] || null;
}

export async function updatePrompt(username: string, prompt: string): Promise<UserProfile> {
    await delay(200);
    const profiles = getProfiles();
    const profile = profiles[username.toLowerCase()];
    if (!profile) throw new Error('Profile not found');
    profile.activePrompt = prompt;
    saveProfiles(profiles);
    return profile;
}

// --- Messages API ---
export async function sendMessage(
    recipientUsername: string,
    content: string,
    prompt: string
): Promise<Message> {
    await delay(400);

    const profiles = getProfiles();
    const profile = profiles[recipientUsername.toLowerCase()];
    if (!profile) throw new Error('User not found');

    const message: Message = {
        id: generateId(),
        recipientUsername: recipientUsername.toLowerCase(),
        content: content.trim(),
        prompt,
        createdAt: new Date().toISOString(),
        isRead: false,
        isFavorite: false,
    };

    const messages = getMessages();
    messages.unshift(message);
    saveMessages(messages);

    // Update message count
    profile.messageCount += 1;
    saveProfiles(profiles);

    return message;
}

export async function fetchInbox(username: string): Promise<Message[]> {
    await delay(300);
    const messages = getMessages();
    return messages
        .filter((m) => m.recipientUsername === username.toLowerCase())
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function markAsRead(messageId: string): Promise<void> {
    await delay(100);
    const messages = getMessages();
    const message = messages.find((m) => m.id === messageId);
    if (message) {
        message.isRead = true;
        saveMessages(messages);
    }
}

export async function toggleFavorite(messageId: string): Promise<Message> {
    await delay(100);
    const messages = getMessages();
    const message = messages.find((m) => m.id === messageId);
    if (!message) throw new Error('Message not found');
    message.isFavorite = !message.isFavorite;
    saveMessages(messages);
    return message;
}

export async function deleteMessage(messageId: string): Promise<void> {
    await delay(200);
    let messages = getMessages();
    messages = messages.filter((m) => m.id !== messageId);
    saveMessages(messages);
}

export async function getUnreadCount(username: string): Promise<number> {
    await delay(50);
    const messages = getMessages();
    return messages.filter((m) => m.recipientUsername === username.toLowerCase() && !m.isRead).length;
}
