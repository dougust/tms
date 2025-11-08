import { authControllerLogin, setAuthToken } from '@dougust/clients';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export async function login(credentials: LoginCredentials): Promise<AuthResult> {
  try {
    const data = await authControllerLogin({
      email: credentials.email,
      password: credentials.password,
    });

    const { accessToken, refreshToken } = (data ?? {}) as any;

    if (!accessToken || !refreshToken) {
      return { success: false, error: 'Invalid server response' };
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }

    setAuthToken(accessToken);

    return { success: true };
  } catch (err: any) {
    let message = 'Login failed';
    const resp = err?.response ?? err;
    const maybeMsg = resp?.data?.message ?? resp?.message ?? err?.message;
    if (Array.isArray(maybeMsg)) message = maybeMsg.join(', ');
    else if (typeof maybeMsg === 'string') message = maybeMsg;
    return { success: false, error: message };
  }
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  setAuthToken(null);
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

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}
