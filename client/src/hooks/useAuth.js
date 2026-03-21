import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export const useAuth = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (sign in, sign out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        if (!supabase) return { error: { message: 'Supabase client not initialized. Check your credentials in .env' } };
        return supabase.auth.signInWithPassword({ email, password });
    };

    const signup = async (email, password, data = {}) => {
        if (!supabase) return { error: { message: 'Supabase client not initialized. Check your credentials in .env' } };
        return supabase.auth.signUp({ 
            email, 
            password,
            options: {
                data: data
            }
        });
    };

    const logout = async () => {
        if (!supabase) return;
        return supabase.auth.signOut();
    };

    return { user, loading, login, signup, logout };
};
