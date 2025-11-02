const TOKEN_KEY = 'auth_token';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export function login(credentials: LoginCredentials): AuthResult {
  if (credentials.username === 'admin' && credentials.password === 'admin') {
    const fakeToken = `fake-token-${Date.now()}`;
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, fakeToken);
    }
    return { success: true };
  }
  return { success: false, error: 'Invalid credentials' };
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  const token = localStorage.getItem(TOKEN_KEY);
  return !!token;
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}
