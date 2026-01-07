import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

export type UserRole = 'user' | 'porter' | 'admin';

const isApprovedPorter = (userId: string): boolean => {
  try {
    const approvedList = JSON.parse(localStorage.getItem('approvedPorters') || '[]');
    return approvedList.some((p: { odId: string }) => p.odId === userId);
  } catch {
    return false;
  }
};

export interface MockUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 'user-1',
    name: 'Nguyễn Văn A',
    email: 'user@test.com',
    role: 'user',
  },
  {
    id: 'porter-1',
    name: 'Trần Văn Porter',
    email: 'porter@test.com',
    role: 'porter',
  },
  {
    id: 'admin-1',
    name: 'Admin VietTrekking',
    email: 'admin@viettrekking.com',
    role: 'admin',
  },
];

const ADMIN_EMAILS = ['admin@viettrekking.com'];

interface AuthContextType {
  currentUser: MockUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isPorter: boolean;
  loading: boolean;
  login: (userId: string) => void;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  switchAccount: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const firebaseUserToMockUser = (firebaseUser: FirebaseUser): MockUser => {
  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName || 'Người dùng',
    email: firebaseUser.email || '',
    avatar: firebaseUser.photoURL || undefined,
    role: isAdmin ? 'admin' : 'user',
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        localStorage.setItem('firebase_uid', firebaseUser.uid);
        setCurrentUser(firebaseUserToMockUser(firebaseUser));
      } else {
        localStorage.removeItem('firebase_uid');
        const savedUserId = localStorage.getItem('currentUserId');
        if (savedUserId) {
          const mockUser = mockUsers.find(u => u.id === savedUserId);
          setCurrentUser(mockUser || null);
        } else {
          setCurrentUser(null);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const login = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUserId', user.id);
    }
  };

  const logout = async () => {
    try {
      if (auth.currentUser) {
        await signOut(auth);
      }
      localStorage.removeItem('currentUserId');
      setCurrentUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const switchAccount = (userId: string) => {
    login(userId);
  };

  const isPorter = useMemo(() => {
    if (!currentUser) return false;
    return currentUser.role === 'porter' || isApprovedPorter(currentUser.id);
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{
      currentUser,
      isLoggedIn: !!currentUser,
      isAdmin: currentUser?.role === 'admin',
      isPorter,
      loading,
      login,
      loginWithGoogle,
      logout,
      switchAccount,
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
