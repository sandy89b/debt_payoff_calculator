import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => void;
  refreshAuth: () => void;
  isLoading: boolean;
}

interface SignUpData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  provider?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for existing authentication on app load
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const authStatus = localStorage.getItem('auth_status');
        const userData = localStorage.getItem('user_data');
        
        if (authStatus === '1' && userData) {
          setIsAuthenticated(true);
          setUser(JSON.parse(userData));
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();

    // Listen for storage changes (for OAuth success)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_status' || e.key === 'user_data') {
        checkAuthStatus();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically for OAuth success (since storage event doesn't fire on same tab)
    const interval = setInterval(checkAuthStatus, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Sign in failed');
      }

      // Store authentication state
      localStorage.setItem('auth_status', '1');
      localStorage.setItem('user_data', JSON.stringify(result.data.user));
      
      setIsAuthenticated(true);
      setUser(result.data.user);
      
      return true;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          confirmPassword: userData.confirmPassword
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Signup failed');
      }

      // Store authentication state
      localStorage.setItem('auth_status', '1');
      localStorage.setItem('user_data', JSON.stringify(result.data.user));
      
      setIsAuthenticated(true);
      setUser(result.data.user);
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get Google OAuth URL from backend
      const response = await fetch('http://localhost:3001/api/auth/google/url');
      const result = await response.json();
      
      if (result.success) {
        // Redirect to Google OAuth
        window.location.href = result.authUrl;
      } else {
        throw new Error('Failed to get Google OAuth URL');
      }
    } catch (error) {
      console.error('Google OAuth error:', error);
      throw error;
    }
  };

  const signOut = () => {
    // Clear authentication state
    localStorage.removeItem('auth_status');
    localStorage.removeItem('user_data');
    
    setIsAuthenticated(false);
    setUser(null);
  };

  const refreshAuth = () => {
    try {
      const authStatus = localStorage.getItem('auth_status');
      const userData = localStorage.getItem('user_data');
      
      if (authStatus === '1' && userData) {
        const parsedUser = JSON.parse(userData);
        setIsAuthenticated(true);
        setUser(parsedUser);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing auth status:', error);
      setIsAuthenticated(false);
      setUser(null);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refreshAuth,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
