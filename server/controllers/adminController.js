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
        const { data, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error('Supabase Auth List Users Error:', authError);
            throw authError;
        }

        const users = data?.users || [];

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
        console.log(`Starting manual deletion for user: ${userId}`);

        // 1. Delete all user notes first
        const { error: notesError } = await supabaseAdmin
            .from('notes')
            .delete()
            .eq('user_id', userId);
        
        if (notesError) {
            console.warn('Notes deletion failed or returned error:', notesError);
            // We continue as notes might not exist or might fail for other reasons
        } else {
            console.log(`Successfully deleted notes for user: ${userId}`);
        }

        // 2. Delete from profiles table
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId);
        
        if (profileError) {
            console.warn('Profile deletion failed for user:', userId, profileError);
        } else {
            console.log(`Successfully deleted profile for user: ${userId}`);
        }

        // 3. Finally, delete user from Supabase Auth
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
        
        if (authError) {
            console.error('Auth deletion failed:', authError);
            throw authError;
        }

        console.log(`Successfully deleted auth user: ${userId}`);
        res.json({ success: true, message: 'User and all related data deleted successfully' });
    } catch (error) {
        console.error('Admin Delete User Error:', error);
        res.status(500).json({ success: false, error: 'Failed to delete user: ' + (error.message || 'Internal Server Error') });
    }
};

export const getSettings = async (req, res) => {
    try {
        const { data, error } = await supabaseAdmin
            .from('settings')
            .select('*');

        if (error) throw error;

        // Convert array to object for easier handling
        const settings = data.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        res.json({ success: true, settings });
    } catch (error) {
        console.error('Admin Get Settings Error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch settings' });
    }
};

export const updateSettings = async (req, res) => {
    const { key, value } = req.body;

    if (!key || value === undefined) {
        return res.status(400).json({ error: 'Missing key or value' });
    }

    try {
        // Upsert setting
        const { error } = await supabaseAdmin
            .from('settings')
            .upsert({ key, value }, { onConflict: 'key' });

        if (error) throw error;

        res.json({ success: true, message: `Setting ${key} updated successfully` });
    } catch (error) {
        console.error('Admin Update Settings Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update settings' });
    }
};
