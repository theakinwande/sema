export interface Message {
  _id: string;
  recipient: string;
  content: string;
  prompt: string;
  createdAt: string;
  isRead: boolean;
  isFavorite: boolean;
}

export interface UserProfile {
  _id: string;
  username: string;
  displayName: string;
  activePrompt: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export const PROMPTS = [
  'send me anonymous messages 👀',
  'tell me what you really think of me 💭',
  'confess something to me 🤫',
  'describe me in 3 words ✨',
  'what\'s your honest opinion about me? 💯',
  'send me something you\'ve never told me 🔒',
  'what do you admire about me? 💜',
  'tell me a secret 🤐',
  'what\'s one thing you\'d change about me? 🪞',
  'ask me anything 🎤',
];

export const formatTimeAgo = (dateString: string): string => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
