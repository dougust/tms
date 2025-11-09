import { AuthResponseDto, setAuthToken } from '@dougust/clients';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  setAuthToken(null);
}

export function getAuthContext(): AuthResponseDto | null {
  const accessToken = localStorage.getItem(TOKEN_KEY) || null;
  const refreshToken = localStorage.getItem(TOKEN_KEY) || null;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    refreshToken,
    accessToken,
  };
}

export function onAuthSuccess(data: AuthResponseDto) {
  const { accessToken, refreshToken } = data;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  setAuthToken(accessToken);
}

export function onAuthError() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}
