// Simple authentication for admin access
'use client';

import * as React from 'react';

const { useState, useEffect } = React;

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
}

// In a real application, this would use a more secure approach
const ADMIN_CREDENTIALS = {
  email: 'admin@example.com', // Matches what we're using in the login page
  password: 'admin123'
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
  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const newAuthState = { isLoggedIn: true, username: email };
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
