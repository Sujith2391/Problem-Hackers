import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // Import our client

// 1. Create the context
const AuthContext = createContext({});

// 2. Create the AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name')
        .eq('id', userId)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Check for an active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    // Listen for auth changes (like login or logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      }
    );

    // Unsubscribe when the component unmounts
    return () => subscription.unsubscribe();
  }, []);

  // 3. Define the functions we want to share
  const authFunctions = {
    signInWithGoogle: () => supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin // Redirect back to our app
      }
    }),
    signOut: () => supabase.auth.signOut(),
    user,
    profile,
    loading,
    isAdmin: profile?.role === 'admin',
  };

  // 4. Wrap the app, providing the auth functions to all children
  return (
    <AuthContext.Provider value={authFunctions}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// 5. Create a simple "hook" to use the context easily
export const useAuth = () => {
  return useContext(AuthContext);
};