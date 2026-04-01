import pool from '../config/db';

export const findUserByEmailOrUsernameDB = async (email: string, username: string) => {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 OR username = $2', 
    [email, username]
  );
  return rows[0];
};

export const findUserByEmailDB = async (email: string) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0];
};

export const findUserByIdDB = async (id: number) => {
  const { rows } = await pool.query(
    'SELECT id, username, email, is_admin, profile_pic FROM users WHERE id = $1', 
    [id]
  );
  return rows[0];
};

export const createUserDB = async (username: string, email: string, passwordHash: string, isAdmin: boolean) => {
  const { rows } = await pool.query(
    `INSERT INTO users (username, email, password_hash, is_admin) 
     VALUES ($1, $2, $3, $4) 
     RETURNING id, username, email, is_admin, profile_pic`,
    [username, email, passwordHash, isAdmin]
  );
  return rows[0];
};