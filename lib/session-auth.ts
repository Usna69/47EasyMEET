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

  // Login function that works with API authentication
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Call the authentication API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!response.ok) {
        console.error('Login failed:', response.statusText);
        return false;
      }
      
      const data = await response.json();
      
      if (data.success && data.user) {
        const newAuthState = {
          isLoggedIn: true,
          username: email,
          user: {
            role: data.user.role,
            email: data.user.email,
            name: data.user.name
          }
        };
        sessionStorage.setItem('authState', JSON.stringify(newAuthState));
        setAuthState(newAuthState);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
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
