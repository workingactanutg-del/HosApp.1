import { supabase } from './supabase';

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

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email || '',
      role: (user.user_metadata?.role || 'PATIENT') as 'PATIENT' | 'DOCTOR' | 'ADMIN',
      name: user.user_metadata?.full_name || 'User'
    };
  } catch (error) {
    return null;
  }
}
