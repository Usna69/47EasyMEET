// Simple authentication for admin access
'use client';

import React from 'react';

const { useState, useEffect } = React;

// Inactivity timeout in milliseconds (40 minutes)
const INACTIVITY_TIMEOUT = 40 * 60 * 1000;

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
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Function to handle user activity
  const handleUserActivity = () => {
    setLastActivity(Date.now());
  };

  // Logout function
  const logout = () => {
    sessionStorage.removeItem('authState');
    setAuthState({ isLoggedIn: false, username: null });
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
    const storedAuthState = sessionStorage.getItem('authState');
    if (storedAuthState) {
      setAuthState(JSON.parse(storedAuthState));
      setLastActivity(Date.now()); // Reset activity timer on login
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

  return { ...authState, login, logout };
};
