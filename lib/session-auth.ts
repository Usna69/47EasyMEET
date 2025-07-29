'use client';

import React from 'react';

const { useEffect, useState } = React;
import { useRouter } from 'next/navigation';

export interface AuthUser {
  role: string;
  email: string;
  name: string;
  department?: string;
  isFirstLogin?: boolean;
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
        console.log('Loaded auth state from session storage:', parsedAuthState);
        setAuthState(parsedAuthState);
      } catch (error) {
        console.error('Error parsing auth state:', error);
        sessionStorage.removeItem('authState'); // Clear corrupted data
        setAuthState({ isLoggedIn: false });
      }
    } else {
      console.log('No stored auth state found');
      setAuthState({ isLoggedIn: false });
    }
  }, []);

  // Logout function
  const logout = () => {
    console.log('User logging out');
    sessionStorage.removeItem('authState');
    setAuthState({ isLoggedIn: false });
    router.replace('/admin/login');
  };

  // Login function that works with API authentication
  const login = async (email: string, password: string): Promise<{ success: boolean; user?: any }> => {
    console.log('Attempting login for:', email);
    console.log('Making API call to /api/auth/login...');
    
    try {
      // Call the authentication API - use relative URL for production compatibility
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      console.log('Login API response status:', response.status);
      console.log('Login API response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login failed:', response.statusText, errorData);
        return { success: false };
      }
      
      const data = await response.json();
      console.log('Login API response data:', data);
      
      if (data.success && data.data?.user) {
        console.log('Found user in data.data.user');
        console.log('User data from API:', data.data.user);
        console.log('isFirstLogin from API:', data.data.user.isFirstLogin);
        const newAuthState = {
          isLoggedIn: true,
          username: email,
          user: {
            role: data.data.user.role,
            email: data.data.user.email,
            name: data.data.user.name,
            department: data.data.user.department || '',
            isFirstLogin: data.data.user.isFirstLogin || false
          }
        };
        
        console.log('Login successful, setting auth state:', newAuthState);
        console.log('isFirstLogin in auth state:', newAuthState.user.isFirstLogin);
        sessionStorage.setItem('authState', JSON.stringify(newAuthState));
        setAuthState(newAuthState);
        return { success: true, user: data.data.user };
      } else if (data.success && data.user) {
        console.log('Found user in data.user');
        console.log('User data from API:', data.user);
        console.log('isFirstLogin from API:', data.user.isFirstLogin);
        // Handle the case where user is directly in data
        const newAuthState = {
          isLoggedIn: true,
          username: email,
          user: {
            role: data.user.role,
            email: data.user.email,
            name: data.user.name,
            department: data.user.department || '',
            isFirstLogin: data.user.isFirstLogin || false
          }
        };
        
        console.log('Login successful, setting auth state:', newAuthState);
        console.log('isFirstLogin in auth state:', newAuthState.user.isFirstLogin);
        sessionStorage.setItem('authState', JSON.stringify(newAuthState));
        setAuthState(newAuthState);
        return { success: true, user: data.user };
      } else {
        console.error('Login response missing user data:', data);
        return { success: false };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
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
