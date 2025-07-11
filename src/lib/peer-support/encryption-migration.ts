import { createClient } from '@/lib/supabase-server';
import { encryptConversationMessage, isEncrypted } from '@/lib/encryption';

// Migrate existing unencrypted messages to encrypted format
export async function migrateMessagesToEncrypted() {
  const supabase = createClient();
  
  try {
    // Get all unencrypted messages
    const { data: messages, error } = await supabase
      .from('peer_support_chats')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages for migration:', error);
      return { success: false, error: error.message };
    }
    
    if (!messages || messages.length === 0) {
      return { success: true, message: 'No messages to migrate' };
    }
    
    let migratedCount = 0;
    let skippedCount = 0;
    
    for (const message of messages) {
      // Skip if already encrypted
      if (isEncrypted(message.message)) {
        skippedCount++;
        continue;
      }
      
      try {
        // Encrypt the message
        const encryptedMessage = encryptConversationMessage(
          message.message, 
          message.sender_id, 
          message.receiver_id
        );
        
        // Update the message with encrypted content
        const { error: updateError } = await supabase
          .from('peer_support_chats')
          .update({ message: encryptedMessage })
          .eq('id', message.id);
        
        if (updateError) {
          console.error(`Failed to update message ${message.id}:`, updateError);
          continue;
        }
        
        migratedCount++;
      } catch (error) {
        console.error(`Failed to encrypt message ${message.id}:`, error);
      }
    }
    
    return {
      success: true,
      migratedCount,
      skippedCount,
      totalMessages: messages.length
    };
    
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, error: 'Migration failed' };
  }
}

// Check if messages need migration
export async function checkMigrationStatus() {
  const supabase = createClient();
  
  try {
    const { data: messages, error } = await supabase
      .from('peer_support_chats')
      .select('message')
      .limit(100); // Sample first 100 messages
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    if (!messages || messages.length === 0) {
      return { success: true, needsMigration: false, message: 'No messages found' };
    }
    
    const unencryptedCount = messages.filter(msg => !isEncrypted(msg.message)).length;
    const encryptedCount = messages.length - unencryptedCount;
    
    return {
      success: true,
      needsMigration: unencryptedCount > 0,
      unencryptedCount,
      encryptedCount,
      totalSampled: messages.length
    };
    
  } catch (error) {
    console.error('Migration status check error:', error);
    return { success: false, error: 'Status check failed' };
  }
} 