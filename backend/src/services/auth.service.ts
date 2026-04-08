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
  throw new Error('Missing required environment variables for JWT');
}

const generateTokens = (userId: number) => {
  const accessToken = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ id: userId }, REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
};

// 1. Define the interface here so the Service is the source of truth
export interface FrontendUser {
  id: number;
  username: string;
  email: string;
  is_admin: boolean | null;
  profile_pic: string | null;
  created_at: Date | null;
}

// 2. EXPLICITLY set the return type to ': FrontendUser'
const formatUserForFrontend = (user: any): FrontendUser => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    is_admin: user.isAdmin,
    profile_pic: user.profilePic, 
    created_at: user.createdAt
  };
};

interface RegisterData { 
  username: string; 
  email: string; 
  password: string; 
}

interface LoginData { 
  email: string; 
  password: string; 
}

export const registerUser = async (userData: RegisterData) => {
  const { username, email, password } = userData;

  const existingUser = await findUserByEmailOrUsernameDB(email, username);
  if (existingUser) throw new Error('USER_EXISTS');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);
  const isAdmin = email === 'abhijithksd23@gmail.com';
  
  const user = await createUserDB(username, email, passwordHash, isAdmin);
  
  if (!user) {
    throw new Error('Database failed to return created user');
  }

  const tokens = generateTokens(user.id);
  
  return { user: formatUserForFrontend(user), ...tokens };
};

export const authenticateUser = async (credentials: LoginData) => {
  const { email, password } = credentials;

  const user = await findUserByEmailDB(email);
  
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const tokens = generateTokens(user.id);
  
  return { user: formatUserForFrontend(user), ...tokens };
};

export const refreshUserToken = async (refreshToken: string) => {
  try {
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as { id: number };
    
    const user = await findUserByIdDB(decoded.id);
    
    if (!user) throw new Error('USER_NOT_FOUND');
    
    const tokens = generateTokens(user.id);
    
    return { user: formatUserForFrontend(user), ...tokens };
  } catch (error) {
    throw new Error('INVALID_TOKEN');
  }
};