import pool from '../config/db';

export const updateUserProfileDB = async (userId: number, username: string, profilePic: string | null) => {
  const query = `
    UPDATE users 
    SET username = $1, profile_pic = $2
    WHERE id = $3
    RETURNING id, username, email, is_admin, profile_pic, created_at;
  `;
  const { rows } = await pool.query(query, [username, profilePic, userId]);
  return rows[0];
};

export const getUserByIdDB = async (userId: number) => {
  const query = `SELECT * FROM users WHERE id = $1;`;
  const { rows } = await pool.query(query, [userId]);
  return rows[0];
};