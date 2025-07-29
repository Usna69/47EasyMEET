// Simple authentication for admin access
'use client';

import React from 'react';

const { useState, useEffect } = React;

// Inactivity timeout in milliseconds (30 minutes)
const INACTIVITY_TIMEOUT = 30 * 60 * 1000;

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

  // Login function - now uses API authentication
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
            name: data.user.name,
            department: data.user.department || ''
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

  return { ...authState, login, logout };
};
