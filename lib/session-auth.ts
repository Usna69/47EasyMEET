'use client';

import React from 'react';

const { useEffect, useState } = React;
import { useRouter } from 'next/navigation';

export interface AuthUser {
  role: string;
  email: string;
  name: string;
}

export interface AuthState {
  isLoggedIn: boolean;
  username?: string;
  user?: AuthUser;
}

export const useSessionAuth = () => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const router = useRouter();

  // Load auth state from session storage on component mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const storedAuthState = sessionStorage.getItem('authState');
    if (storedAuthState) {
      try {
        const parsedAuthState = JSON.parse(storedAuthState);
        setAuthState(parsedAuthState);
      } catch (error) {
        console.error('Error parsing auth state:', error);
        setAuthState({ isLoggedIn: false });
      }
    } else {
      setAuthState({ isLoggedIn: false });
    }
  }, []);

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('authState');
    setAuthState({ isLoggedIn: false });
    router.replace('/admin/login');
  };

  // Login function
  const login = (email: string, password: string): boolean => {
    // Hardcoded credentials check for admin
    if (email === 'Adminmeets@nairobi.go.ke' && password === 'MEETM@st@123') {
      const newAuthState = {
        isLoggedIn: true,
        username: email,
        user: {
          role: 'ADMIN',
          email: email,
          name: 'Admin User'
        }
      };
      sessionStorage.setItem('authState', JSON.stringify(newAuthState));
      setAuthState(newAuthState);
      return true;
    }
    return false;
  };

  // Check if user is authorized for specific roles
  const isAuthorized = (allowedRoles: string[]): boolean => {
    if (!authState?.isLoggedIn || !authState?.user) return false;
    return allowedRoles.includes(authState.user.role);
  };

  return { 
    isLoggedIn: authState?.isLoggedIn || false,
    user: authState?.user || null,
    login, 
    logout,
    isAuthorized
  };
};
