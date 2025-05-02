export type UserRole = 'owner' | 'employee' | 'viewer' | null;

export interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
}

export const checkPassword = (password: string): UserRole => {
  if (password === import.meta.env.VITE_OWNER_PASSWORD) return 'owner';
  if (password === import.meta.env.VITE_EMPLOYEE_PASSWORD) return 'employee';
  if (password === import.meta.env.VITE_VIEWER_PASSWORD) return 'viewer';
  return null;
};

export const getStoredAuth = (): AuthState => {
  const stored = localStorage.getItem('authState');
  if (stored) {
    return JSON.parse(stored);
  }
  return { role: null, isAuthenticated: false };
};

export const storeAuth = (state: AuthState) => {
  localStorage.setItem('authState', JSON.stringify(state));
};

export const clearAuth = () => {
  localStorage.removeItem('authState');
};