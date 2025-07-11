import crypto from 'crypto';

// Encryption configuration
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // For GCM, this is 12 bytes
const TAG_LENGTH = 16; // GCM tag length
const KEY_LENGTH = 32; // 256 bits
const SALT_LENGTH = 32;

// Generate a random encryption key for a user
export function generateUserKey(): string {
  return crypto.randomBytes(KEY_LENGTH).toString('hex');
}

// Derive encryption key from user's password or generate a new one
export function deriveKey(password: string, salt?: string): { key: Buffer; salt: string } {
  const saltBuffer = salt ? Buffer.from(salt, 'hex') : crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(password, saltBuffer, 100000, KEY_LENGTH, 'sha256');
  return { key, salt: saltBuffer.toString('hex') };
}

// Encrypt a message using AES-256-GCM
export function encryptMessage(message: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    cipher.setAAD(Buffer.from('peer-support-chat', 'utf8')); // Additional authenticated data
    
    let encrypted = cipher.update(message, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    // Combine IV, encrypted data, and auth tag
    const result = iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
    return result;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Failed to encrypt message');
  }
}

// Decrypt a message using AES-256-GCM
export function decryptMessage(encryptedMessage: string, key: string): string {
  try {
    const keyBuffer = Buffer.from(key, 'hex');
    const parts = encryptedMessage.split(':');
    
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted message format');
    }
    
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const tag = Buffer.from(parts[2], 'hex');
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(tag);
    decipher.setAAD(Buffer.from('peer-support-chat', 'utf8'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt message');
  }
}

// Generate a conversation key for two users
export function generateConversationKey(user1Id: string, user2Id: string): string {
  // Sort user IDs to ensure consistent key generation regardless of sender/receiver order
  const sortedIds = [user1Id, user2Id].sort();
  const combined = sortedIds.join(':');
  const hash = crypto.createHash('sha256').update(combined).digest('hex');
  return hash.substring(0, KEY_LENGTH * 2); // Convert to hex string of proper length
}

// Encrypt message for a conversation between two users
export function encryptConversationMessage(message: string, user1Id: string, user2Id: string): string {
  const conversationKey = generateConversationKey(user1Id, user2Id);
  return encryptMessage(message, conversationKey);
}

// Decrypt message for a conversation between two users
export function decryptConversationMessage(encryptedMessage: string, user1Id: string, user2Id: string): string {
  const conversationKey = generateConversationKey(user1Id, user2Id);
  return decryptMessage(encryptedMessage, conversationKey);
}

// Validate if a string is encrypted
export function isEncrypted(text: string): boolean {
  return text.includes(':') && text.split(':').length === 3;
}

// Deterministic user key generator (userId + secret)
export function getUserKey(userId: string): string {
  const secret = process.env.ENCRYPTION_SECRET || 'default_secret'; // Set this in your environment!
  return crypto.createHash('sha256').update(userId + secret).digest('hex');
} 