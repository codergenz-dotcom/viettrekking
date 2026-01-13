import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { authService, userService, type LoginResponse, type GoogleLoginResponse } from '@/services/api';

export interface AppUser {
  id: string;
  username: string;
  email: string;
  name: string;
  full_name: string;
  role: 'ADMIN' | 'USER';
  avatar?: string;
  phone?: string;
}

type AuthResponse = LoginResponse | GoogleLoginResponse;

const isGoogleResponse = (data: AuthResponse): data is GoogleLoginResponse => {
  return 'accessToken' in data;
};

interface AuthContextType {
  currentUser: AppUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  loading: boolean;
  setUser: (data: AuthResponse) => Promise<void>;
  logout: () => void;
  loginWithGoogle: () => Promise<GoogleLoginResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      try {
        const userStr = localStorage.getItem('user');
        const userProfileStr = localStorage.getItem('user_profile');
        let phone = '';
        let profileId = '';

        if (userProfileStr) {
          try {
            const profile = JSON.parse(userProfileStr);
            phone = profile.phone || '';
            profileId = profile.id || '';
          } catch (e) {
            console.error('Error parsing user profile from local storage', e);
          }
        }

        if (userStr) {
          const userData = JSON.parse(userStr);

          if ('accessToken' in userData) {
            setCurrentUser({
              id: profileId,
              username: userData.username,
              email: userData.email,
              name: userData.fullName,
              full_name: userData.fullName,
              role: userData.role,
              avatar: userData.avatarUrl,
              phone: phone,
            });
          } else {
            const normalizedRole = (userData.role as string) === 'PORTER' ? 'USER' : userData.role;
            setCurrentUser({
              id: userData.id || profileId,
              username: userData.username,
              email: userData.email,
              name: userData.full_name,
              full_name: userData.full_name,
              role: normalizedRole,
              avatar: userData.avatar,
              phone: phone,
            });
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('user_profile');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();

    const handleSessionExpired = (event: any) => {
      const shouldRedirect = event.detail?.shouldRedirect !== false;

      setCurrentUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('firebase_uid');

      if (shouldRedirect && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    };

    window.addEventListener('auth:session-expired' as any, handleSessionExpired);
    return () => {
      window.removeEventListener('auth:session-expired' as any, handleSessionExpired);
    };
  }, []);

  const setUser = async (data: AuthResponse) => {
    if (isGoogleResponse(data)) {
      localStorage.setItem('access_token', data.accessToken);
      localStorage.setItem('refresh_token', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data));

      setCurrentUser({
        id: '',
        username: data.username,
        email: data.email,
        name: data.fullName,
        full_name: data.fullName,
        role: data.role,
        avatar: data.avatarUrl,
      });
    } else {
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('user', JSON.stringify(data));

      const normalizedRole = (data.role as string) === 'PORTER' ? 'USER' : data.role;
      setCurrentUser({
        id: data.id,
        username: data.username,
        email: data.email,
        name: data.full_name,
        full_name: data.full_name,
        role: normalizedRole,
        avatar: data.avatar,
      });
    }

    try {
      const profileResponse = await userService.getCurrentProfile();
      if (profileResponse.data) {
        localStorage.setItem('user_profile', JSON.stringify(profileResponse.data));
        setCurrentUser(prev => prev ? {
          ...prev,
          id: profileResponse.data.id || prev.id,
          phone: profileResponse.data.phone
        } : prev);
      }
    } catch (error) {
      console.error('Failed to fetch user profile after login', error);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      console.log('✅ Logout API success');
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('user_profile');
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('firebase_uid');
      setCurrentUser(null);
      window.location.href = '/login';
    }
  };

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      const { signInWithPopup } = await import('firebase/auth');
      const { auth, googleProvider } = await import('@/lib/firebase');

      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      const idToken = await firebaseUser.getIdToken();

      const response = await authService.googleLogin({ idToken });

      setUser(response.data);

      localStorage.setItem('firebase_uid', firebaseUser.uid);

      return response.data;
    } catch (error) {
      console.error('Error logging in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = useMemo(() => {
    return currentUser?.role === 'ADMIN';
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      isAdmin,
      loading,
      setUser,
      logout,
      loginWithGoogle,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
