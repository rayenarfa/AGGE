import { createContext, useContext, useState, useEffect } from 'react';
import {
  login as loginService,
  register as registerService,
  logout as logoutService,
  getMe,
} from '../services/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Run initial session check and listen for auth state changes
  useEffect(() => {
    let isMounted = true;

    async function loadUser() {
      try {
        const data = await getMe();
        if (isMounted) {
          setUser(data?.user || null);
        }
      } catch {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Log in user and save session state
   */
  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await loginService(email, password);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Register user and save session state
   */
  const register = async (userData) => {
    setLoading(true);
    try {
      const data = await registerService(userData);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Clear session state and log out
   */
  const logout = async () => {
    setLoading(true);
    try {
      await logoutService();
    } catch (error) {
      console.error('Logout failed on server', error);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  /**
   * Refetch user profile from server to sync local state
   */
  const reloadUser = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
      return data.user;
    } catch {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, reloadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
export default AuthContext;
