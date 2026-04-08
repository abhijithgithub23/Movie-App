import { eq } from 'drizzle-orm';
import { db } from '../config/db';
import { users } from '../db/schema';

export const updateUserProfileDB = async (userId: number, username: string, profilePic: string | null) => {
  const result = await db.update(users)
    .set({
      username,
      profilePic,
    })
    .where(eq(users.id, userId))
    .returning({
      id: users.id,
      username: users.username,
      email: users.email,
      isAdmin: users.isAdmin,
      profilePic: users.profilePic,
      createdAt: users.createdAt,
    });
    
  return result[0];
};

export const getUserByIdDB = async (userId: number) => {
  const result = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
    
  return result[0];
};