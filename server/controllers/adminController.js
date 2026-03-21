import { supabaseAdmin } from '../lib/supabaseAdmin.js';
import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN_SECRET = Buffer.from(ADMIN_PASSWORD).toString('base64');

export const adminLogin = async (req, res) => {
    const { password } = req.body;

    if (password === ADMIN_PASSWORD) {
        return res.json({ 
            success: true, 
            token: ADMIN_TOKEN_SECRET,
            message: 'Admin login successful' 
        });
    }

    res.status(401).json({ success: false, error: 'Invalid admin password' });
};

export const listAllUsers = async (req, res) => {
    try {
        // Fetch users from auth and join with profiles
        // Note: listUsers() returns an array with a `users` property
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) throw authError;

        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*');

        if (profileError) throw profileError;

        // Merge data
        const mergedUsers = users.map(user => {
            const profile = profiles.find(p => p.id === user.id);
            return {
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'N/A',
                phone: user.user_metadata?.phone || 'N/A',
                plan: profile?.plan || 'free',
                ai_usage: profile?.ai_usage_count || 0,
                mindmap_usage: profile?.mindmap_usage_count || 0,
                created_at: user.created_at
            };
        });

        res.json({ success: true, users: mergedUsers });
    } catch (error) {
        console.error('Admin List Users Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch users' });
    }
};

export const updateUserPlan = async (req, res) => {
    const { userId, plan } = req.body;

    if (!userId || !plan) {
        return res.status(400).json({ error: 'Missing userId or plan' });
    }

    if (!['free', 'pro'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan type' });
    }

    try {
        // Check if profile exists
        const { data: profile, error: fetchError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError && fetchError.code === 'PGRST116') {
            // Create if missing
            const { error: createError } = await supabaseAdmin
                .from('profiles')
                .insert([{ id: userId, plan, ai_usage_count: 0, mindmap_usage_count: 0 }]);
            if (createError) throw createError;
        } else {
            // Update
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({ plan })
                .eq('id', userId);
            if (updateError) throw updateError;
        }

        res.json({ success: true, message: `User plan updated to ${plan}` });
    } catch (error) {
        console.error('Admin Update Plan Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update user plan' });
    }
};

export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
        return res.status(400).json({ error: 'Missing userId' });
    }

    try {
        // 1. Delete user from Supabase Auth (this also takes care of cascade if configured, 
        // but we'll manually handle profiles to be safe)
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        if (authError) throw authError;

        // 2. Delete from profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        // Note: We don't throw for profileError if the user was deleted from Auth successfully,
        // but it's good to log it.
        if (profileError) console.warn('Profile deletion failed for user:', userId, profileError);

        res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user' });
    }
};
