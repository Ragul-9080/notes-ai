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
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    fullName: data.full_name, 
                    phone: data.phone 
                }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Signup failed');
            return { data: result, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const verifyOtp = async (email, token, password) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/auth/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token }),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || 'Verification failed');
            
            // After successful server-side verification, automatically sign in the user
            const authResult = await supabase.auth.signInWithPassword({ email, password });
            if (authResult.error) throw authResult.error;

            return { data: authResult.data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    };

    const logout = async () => {
        if (!supabase) return;
        return supabase.auth.signOut();
    };

    return { user, loading, login, signup, logout, verifyOtp };
};
