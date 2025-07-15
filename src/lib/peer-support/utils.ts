// Generate a consistent chat ID from two user IDs
export function generateChatId(user1: string, user2: string): string {
  return [user1, user2].sort().join('_');
}

// Extract peer ID from chat ID for a given user
export function getPeerIdFromChatId(chatId: string, currentUserId: string): string | null {
  const parts = chatId.split('_');
  if (parts.length === 2) {
    return parts[0] === currentUserId ? parts[1] : parts[0];
  }
  return null;
}

// Validate if a chat ID is properly formatted
export function isValidChatId(chatId: string): boolean {
  const parts = chatId.split('_');
  return parts.length === 2 && Boolean(parts[0]) && Boolean(parts[1]) && parts[0] !== parts[1];
}

// Get chat URL for a peer
export function getChatUrl(currentUserId: string, peerId: string): string {
  const chatId = generateChatId(currentUserId, peerId);
  return `/peer-support/chat/${chatId}`;
} 