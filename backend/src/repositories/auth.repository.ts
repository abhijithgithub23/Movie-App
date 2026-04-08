// src/repositories/auth.repository.ts
import { eq, or } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '../db/schema';

// 1. Used for registration: we need the full record (including password) to check if exists
export const findUserByEmailOrUsernameDB = async (email: string, username: string) => {
  const result = await db
    .select()
    .from(users)
    .where(or(eq(users.email, email), eq(users.username, username)))
    .limit(1);
    
  return result[0]; // Safely returns User | undefined
};

// 2. Used for login: we MUST fetch passwordHash to verify credentials
export const findUserByEmailDB = async (email: string) => {
  const result = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
    
  return result[0];
};

// 3. Used for token refresh: public-facing, STRICTLY OMIT passwordHash
export const findUserByIdDB = async (id: number) => {
  const result = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      profilePic: users.profilePic,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
    
  return result[0]; 
};

// 4. Used for registration: returns sanitized user data
export const createUserDB = async (username: string, email: string, passwordHash: string, isAdmin: boolean) => {
  const result = await db
    .insert(users)
    .values({
      username,
      email,
      passwordHash,
      isAdmin,
    })
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      profilePic: users.profilePic,
    });
    
  return result[0];
};