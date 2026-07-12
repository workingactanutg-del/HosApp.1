import { supabase } from './supabase';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-hosapp-jwt';

export interface AuthUser {
  id: string;
  email: string;
  role: 'PATIENT' | 'DOCTOR' | 'ADMIN';
  name: string;
}

export async function verifyAuth(request: Request): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.split(' ')[1];
    if (!token) {
      return null;
    }

    // 1. Try verifying with Supabase Auth first
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (!error && user) {
        return {
          id: user.id,
          email: user.email || '',
          role: (user.user_metadata?.role || 'PATIENT') as 'PATIENT' | 'DOCTOR' | 'ADMIN',
          name: user.user_metadata?.full_name || 'User'
        };
      }
    } catch (e) {
      // Ignore and fall through to JWT check
    }

    // 2. Fallback: Verify with local JWT (for demo accounts)
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
      return decoded;
    } catch (jwtErr) {
      return null;
    }
  } catch (error) {
    return null;
  }
}
