require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Debug output for env variables
console.log('SUPABASE_URL:', process.env.SUPABASE_URL);
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing');
console.log('ENCRYPTION_SECRET:', process.env.ENCRYPTION_SECRET ? 'set' : 'missing');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const KEY_LENGTH = 32;

function getUserKey(userId) {
  return crypto.createHash('sha256').update(userId + ENCRYPTION_SECRET).digest('hex');
}

function encryptMessage(message, key) {
  const keyBuffer = Buffer.from(key, 'hex');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
  cipher.setAAD(Buffer.from('user-data', 'utf8'));
  let encrypted = cipher.update(message, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + encrypted + ':' + tag.toString('hex');
}

function isEncrypted(text) {
  return typeof text === 'string' && text.includes(':') && text.split(':').length === 3;
}

async function migrateMindfulnessEntries() {
  let { data: entries, error } = await supabase
    .from('mindfulness_entries')
    .select('*');

  if (error) throw error;

  let migrated = 0;
  for (const entry of entries) {
    if (!isEncrypted(entry.content)) {
      const key = getUserKey(entry.user_id);
      const encryptedContent = encryptMessage(entry.content, key);
      const { error: updateError } = await supabase
        .from('mindfulness_entries')
        .update({ content: encryptedContent })
        .eq('id', entry.id);
      if (!updateError) migrated++;
    }
  }
  console.log(`Mindfulness entries migrated: ${migrated}`);
}

async function migrateProfiles() {
  let { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, dob, location, gender');

  if (error) throw error;

  let migrated = 0;
  for (const profile of profiles) {
    const key = getUserKey(profile.id);
    const updates = {};
    if (profile.dob && !isEncrypted(profile.dob)) {
      updates.dob = encryptMessage(profile.dob, key);
    }
    if (profile.location && !isEncrypted(profile.location)) {
      updates.location = encryptMessage(profile.location, key);
    }
    if (profile.gender && !isEncrypted(profile.gender)) {
      updates.gender = encryptMessage(profile.gender, key);
    }
    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      if (!updateError) migrated++;
    }
  }
  console.log(`Profiles migrated: ${migrated}`);
}

(async () => {
  try {
    await migrateMindfulnessEntries();
    await migrateProfiles();
    console.log('Migration complete!');
    process.exit(0);
  } catch (e) {
    console.error('Migration failed:', e);
    process.exit(1);
  }
})();