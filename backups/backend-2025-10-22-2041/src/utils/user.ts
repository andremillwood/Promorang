/**
 * Ensures a user exists in the database, creating them if necessary.
 * @param DB - D1Database instance (must be passed explicitly)
 * @param profile - User profile data from OAuth provider
 * @returns User record from database
 * @throws Error if DB is undefined
 */
export async function ensureUser(
  DB: D1Database,
  profile: { sub: string; email?: string; name?: string; picture?: string }
) {
  // ✅ Defensive check: Ensure DB is defined
  if (!DB) {
    console.error('❌ CRITICAL: DB is undefined in ensureUser')
    throw new Error('DB is undefined in ensureUser - cannot proceed')
  }
  
  console.log('✅ ensureUser DB received:', !!DB, 'typeof:', typeof DB)
  
  const { sub, email, name, picture } = profile

  // 1. Check if user exists
  const existing = await DB.prepare('SELECT * FROM users WHERE id=? OR google_sub=?')
    .bind(sub, sub)
    .first()
  
  if (existing) {
    console.log('✅ User found:', existing.id)
    return existing
  }

  console.log('📝 Creating new user:', sub)

  // 2. Insert new user
  await DB.prepare(`
    INSERT INTO users (id, google_sub, email, name, picture, tier, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, 'free', ?, ?)
  `).bind(sub, sub, email || '', name || '', picture || '', Date.now(), Date.now()).run()

  // 3. Initialize balances row
  await DB.prepare('INSERT OR IGNORE INTO balances (user_id) VALUES (?)')
    .bind(sub)
    .run()

  const newUser = await DB.prepare('SELECT * FROM users WHERE id=?')
    .bind(sub)
    .first()
  
  console.log('✅ User created:', newUser?.id)
  return newUser
}
