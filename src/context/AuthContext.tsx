import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db, handleFirestoreError, OperationType } from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sync user profile to Firestore
  const syncUserProfile = async (firebaseUser: User) => {
    try {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const snap = await getDoc(userRef);
      if (!snap.exists()) {
        await setDoc(userRef, {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Kitchen Staff',
          photoURL: firebaseUser.photoURL || '',
          role: 'manager',
          createdAt: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.warn('User profile sync note:', err);
      // Non-blocking for auth session
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      setUser(currentUser);
      if (currentUser) {
        await syncUserProfile(currentUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signInWithGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Google Sign In Error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in cancelled. Please complete sign-in in the popup.');
      } else if (err.code === 'auth/cancelled-popup-request') {
        setError('Another popup is already open.');
      } else {
        setError(err.message || 'Failed to sign in with Google');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, pass);
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email Sign In Error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please verify and try again.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled in Firebase Console. Please sign in with Google or enable Email/Password provider in the Firebase Console.');
      } else {
        setError(err.message || 'Failed to sign in. Please try again.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUpWithEmail = async (email: string, pass: string, displayName?: string) => {
    setError(null);
    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, pass);
      if (result.user && displayName) {
        await updateProfile(result.user, { displayName });
      }
      if (result.user) {
        await syncUserProfile(result.user);
      }
    } catch (err: any) {
      console.error('Email Sign Up Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email address is already registered. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password must be at least 6 characters long.');
      } else if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password provider is not enabled in Firebase Console. Please sign in with Google or enable Email/Password provider in the Firebase Console.');
      } else {
        setError(err.message || 'Failed to create account.');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: any) {
      console.error('Sign Out Error:', err);
      setError(err.message || 'Failed to sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
