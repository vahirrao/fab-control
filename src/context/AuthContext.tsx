import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fbSignOut,
  onAuthStateChanged,
  FirebaseUser,
  db,
  handleFirestoreError,
  OperationType,
} from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile, UserRole } from '../types';
import { DEMO_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile;
  role: UserRole;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchPersona: (role: UserRole) => void;
  availablePersonas: UserProfile[];
  hasPermission: (permission: string) => boolean;
  canAccessShop: (shopCode: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  // Default persona is Super Admin (matching user email vaibhavbackupphoto1@gmail.com)
  const [profile, setProfile] = useState<UserProfile>(DEMO_USERS[0]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
          } else {
            // New user registration - check if email matches admin
            const isSuper = user.email === 'vaibhavbackupphoto1@gmail.com';
            const newProfile: UserProfile = {
              uid: user.uid,
              name: user.displayName || user.email?.split('@')[0] || 'Technova Staff',
              email: user.email || '',
              role: isSuper ? 'super_admin' : 'shop_supervisor',
              assignedShops: isSuper ? ['ALL'] : ['A1', 'A2/A3/A4'],
              department: isSuper ? 'Executive Management' : 'Shop Operations',
              status: 'active',
              photoURL: user.photoURL || undefined,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('Error fetching user profile from Firestore, using default persona:', err);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      // If popup blocked or cancelled, remain on high-fidelity persona session
      handleFirestoreError(err, OperationType.GET, 'auth');
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      // Reset to super admin preview
      setProfile(DEMO_USERS[0]);
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  const switchPersona = (newRole: UserRole) => {
    const persona = DEMO_USERS.find((p) => p.role === newRole) || DEMO_USERS[0];
    setProfile(persona);
  };

  const hasPermission = (permission: string): boolean => {
    const role = profile.role;
    if (role === 'super_admin' || role === 'technova_admin') return true;

    switch (permission) {
      case 'create_work_order':
        return ['shop_supervisor', 'fabrication_manager', 'maintenance_coordinator'].includes(role);
      case 'approve_work_order':
        return ['fabrication_manager', 'plant_manager'].includes(role);
      case 'pe_approval':
        return role === 'plant_engineer';
      case 'assign_technician':
        return ['fabrication_manager', 'technova_admin'].includes(role);
      case 'execute_job':
        return ['technician', 'fabrication_manager'].includes(role);
      case 'verify_inspection':
        return ['shop_supervisor', 'plant_engineer', 'fabrication_manager'].includes(role);
      case 'manage_rate_card':
        return ['super_admin', 'technova_admin', 'accounts_finance'].includes(role);
      case 'manage_assets':
        return ['technova_admin', 'maintenance_coordinator', 'shop_supervisor'].includes(role);
      case 'manage_pm':
        return ['maintenance_coordinator', 'fabrication_manager'].includes(role);
      case 'manage_mhe':
        return ['maintenance_coordinator', 'technova_admin', 'fabrication_manager'].includes(role);
      case 'view_financials':
        return ['super_admin', 'technova_admin', 'plant_manager', 'accounts_finance'].includes(role);
      case 'export_mis':
        return ['super_admin', 'technova_admin', 'plant_manager', 'accounts_finance'].includes(role);
      case 'safety_lockout':
        return ['shop_supervisor', 'plant_engineer', 'maintenance_coordinator', 'technova_admin'].includes(role);
      default:
        return false;
    }
  };

  const canAccessShop = (shopCode: string): boolean => {
    if (profile.role === 'super_admin' || profile.role === 'technova_admin' || profile.role === 'plant_manager' || profile.role === 'fabrication_manager' || profile.role === 'plant_engineer' || profile.role === 'accounts_finance') {
      return true;
    }
    if (profile.assignedShops.includes('ALL')) return true;
    return profile.assignedShops.includes(shopCode);
  };

  const contextValue = useMemo(() => ({
    currentUser,
    profile,
    role: profile.role,
    loading,
    signInWithGoogle,
    signOut,
    switchPersona,
    availablePersonas: DEMO_USERS,
    hasPermission,
    canAccessShop,
  }), [currentUser, profile, loading]);

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
