// Simple authentication for admin access
'use client';

import { useState, useEffect } from 'react';

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
}

// In a real application, this would use a more secure approach
const ADMIN_CREDENTIALS = {
  username: 'ADMIN',
  password: 'MEETM@st@047'
};

// Initialize auth state from session storage if available
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    username: null
  });

  // Load auth state from session storage on component mount
  useEffect(() => {
    const storedAuthState = sessionStorage.getItem('authState');
    if (storedAuthState) {
      setAuthState(JSON.parse(storedAuthState));
    }
  }, []);

  // Login function
  const login = (username: string, password: string): boolean => {
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      const newAuthState = { isLoggedIn: true, username };
      sessionStorage.setItem('authState', JSON.stringify(newAuthState));
      setAuthState(newAuthState);
      return true;
    }
    return false;
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('authState');
    setAuthState({ isLoggedIn: false, username: null });
  };

  return { ...authState, login, logout };
};
