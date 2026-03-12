import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

export interface SupabaseAuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemo: boolean; // true when user has no workspace
  workspaceId: string | null;
}

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth listener BEFORE getSession
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Check workspace membership - use setTimeout to avoid deadlock
          setTimeout(async () => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('workspace_id, first_login_at')
              .eq('id', session.user.id)
              .single();
            
            if (profile) {
              setWorkspaceId(profile.workspace_id);
              
              // Track first login
              if (!profile.first_login_at) {
                await supabase
                  .from('profiles')
                  .update({ first_login_at: new Date().toISOString() })
                  .eq('id', session.user.id);
              }
            }
          }, 0);
        } else {
          setWorkspaceId(null);
        }
        
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + '/login',
        data: { full_name: fullName },
      },
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  return {
    user,
    session,
    loading,
    workspaceId,
    isDemo: !!user && !workspaceId,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };
}
