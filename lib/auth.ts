// Simple authentication for admin access
'use client';

import React from 'react';

const { useState, useEffect } = React;

// Inactivity timeout in milliseconds (40 minutes)
const INACTIVITY_TIMEOUT = 40 * 60 * 1000;

export interface AuthState {
  isLoggedIn: boolean;
  username: string | null;
  user?: {
    email?: string;
    name?: string;
    role?: 'ADMIN' | 'CREATOR';
    department?: string;
  };
}

// In a real application, this would use a more secure approach
// Updated credentials per client requirements
const ADMIN_CREDENTIALS = {
  email: 'Adminmeets@nairobi.go.ke', // Official admin email
  password: 'MEETM@st@123' // Strong password with special characters
};

// Initialize auth state from session storage if available
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    username: null,
    user: undefined
  });
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to handle user activity
  const handleUserActivity = () => {
    setLastActivity(Date.now());
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('authState');
    setAuthState({ isLoggedIn: false, username: null, user: undefined });
  };
  
  // Set up activity listeners
  useEffect(() => {
    if (authState.isLoggedIn) {
      // Reset activity timer on user interaction
      const activityEvents = ['mousedown', 'keypress', 'scroll', 'mousemove', 'click', 'touchstart'];
      activityEvents.forEach(eventType => {
        window.addEventListener(eventType, handleUserActivity);
      });

      // Set up tab close/refresh listener
      const handleTabClose = () => {
        // This will run when the tab is closed or refreshed
        logout();
      };
      window.addEventListener('beforeunload', handleTabClose);

      return () => {
        // Clean up event listeners
        activityEvents.forEach(eventType => {
          window.removeEventListener(eventType, handleUserActivity);
        });
        window.removeEventListener('beforeunload', handleTabClose);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [authState.isLoggedIn]);

  // Check for inactivity timeout
  useEffect(() => {
    if (authState.isLoggedIn) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        const currentTime = Date.now();
        const timeSinceLastActivity = currentTime - lastActivity;

        if (timeSinceLastActivity >= INACTIVITY_TIMEOUT) {
          console.log('Logging out due to inactivity');
          logout();
          // Redirect to login page if needed
          window.location.href = '/admin/login';
        }
      }, INACTIVITY_TIMEOUT);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [lastActivity, authState.isLoggedIn]);

  // Load auth state from session storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuthState = sessionStorage.getItem('authState');
      if (storedAuthState) {
        try {
          const parsedState = JSON.parse(storedAuthState);
          setAuthState(parsedState);
          setLastActivity(Date.now()); // Reset activity timer on login
        } catch (error) {
          console.error('Error parsing auth state:', error);
          sessionStorage.removeItem('authState');
          setAuthState({ isLoggedIn: false, username: null, user: undefined });
        }
      }
      
      // Clear any navigation flags to prevent redirect loops
      sessionStorage.removeItem('redirecting');
    }
  }, []);

  // Login function
  const login = (email: string, password: string): boolean => {
    console.log('Login attempt:', { email, passwordLength: password.length });
    console.log('Expected:', { expectedEmail: ADMIN_CREDENTIALS.email });
    
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      // Create a proper auth state with user role information
      const newAuthState: AuthState = { 
        isLoggedIn: true, 
        username: email,
        user: {
          email: email,
          name: 'Admin User',
          role: 'ADMIN' // Set role to ADMIN for admin dashboard functionality
        }
      };
      
      console.log('Login successful, setting auth state:', newAuthState);
      sessionStorage.setItem('authState', JSON.stringify(newAuthState));
      setAuthState(newAuthState);
      return true;
    }
    
    console.log('Login failed: Invalid credentials');
    return false;
  };

  return { ...authState, login, logout };
};
