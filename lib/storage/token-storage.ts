const TOKEN_KEY = 'hirable_access_token';

export interface JWTPayload {
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER';
  userId: string;
  iat?: number;
  exp?: number;
}

class TokenStorage {
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(TOKEN_KEY, token);
  }

  removeToken(): void {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(TOKEN_KEY);
  }

  decodeToken(token: string): JWTPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      const payload = parts[1];
      const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
      const parsed = JSON.parse(decoded) as JWTPayload;

      if (this.isTokenExpired(parsed)) {
        return null;
      }

      return parsed;
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TokenStorage] Failed to decode token:', error);
      }
      return null;
    }
  }

  private isTokenExpired(payload: JWTPayload): boolean {
    if (!payload.exp) {
      return false;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  getDecodedToken(): JWTPayload | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }
}

export const tokenStorage = new TokenStorage();

