import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const getSubscriptionStatus = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch profile
        let { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error && error.code === 'PGRST116') { // Profile not found
            // Initialize profile
            const { data: newProfile, error: createError } = await supabaseAdmin
                .from('profiles')
                .insert([{ id: userId, plan: 'free', ai_usage_count: 0, mindmap_usage_count: 0 }])
                .select()
                .single();

            if (createError) throw createError;
            profile = newProfile;
        } else if (error) {
            throw error;
        }

        res.json(profile);
    } catch (error) {
        console.error('Get Subscription Status Error:', error);
        res.status(500).json({ error: 'Failed to fetch subscription status' });
    }
};

export const upgradeToPro = async (req, res) => {
    const userId = req.user.id;

    try {
        const { data: profile, error } = await supabaseAdmin
            .from('profiles')
            .update({ plan: 'pro' })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json({ message: 'Upgraded to Pro successfully', profile });
    } catch (error) {
        console.error('Upgrade to Pro Error:', error);
        res.status(500).json({ error: 'Failed to upgrade to Pro' });
    }
};
