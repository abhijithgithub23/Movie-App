import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { 
  findUserByEmailOrUsernameDB, 
  findUserByEmailDB, 
  createUserDB, 
  findUserByIdDB 
} from '../repositories/auth.repository';

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const REFRESH_SECRET = process.env.REFRESH_SECRET as string;

if (!JWT_SECRET || !REFRESH_SECRET) {
  throw new Error('Missing required environment variables');
}

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

export const registerUser = async (userData: any) => {
  const { username, email, password } = userData;

  const existingUser = await findUserByEmailOrUsernameDB(email, username);
  if (existingUser) throw new Error('USER_EXISTS');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const isAdmin = email === 'abhijithksd23@gmail.com';
  
  const user = await createUserDB(username, email, passwordHash, isAdmin);
  const tokens = generateTokens(user.id);
  
  return { user, ...tokens };
};

export const authenticateUser = async (credentials: any) => {
  const { email, password } = credentials;

  const user = await findUserByEmailDB(email);
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user.id);
  const { password_hash, ...safeUser } = user;
  
  return { user: safeUser, ...tokens };
};

export const refreshUserToken = async (refreshToken: string) => {
  try {
    // jwt.verify acts synchronously when no callback is provided
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };
    
    const user = await findUserByIdDB(decoded.id);
    if (!user) throw new Error('USER_NOT_FOUND');
    
    const tokens = generateTokens(user.id);
    return { user, ...tokens };
  } catch (error) {
    throw new Error('INVALID_TOKEN');
  }
};