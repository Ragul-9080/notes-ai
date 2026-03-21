import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const getNotes = async (req, res) => {
    const { tag, search, is_pinned } = req.query;
    const userId = req.user.id;

    try {
        let query = supabaseAdmin
            .from('notes')
            .select('*')
            .eq('user_id', userId)
            .order('is_pinned', { ascending: false })
            .order('created_at', { ascending: false });

        if (is_pinned === 'true') {
            query = query.eq('is_pinned', true);
        }

        if (tag) {
            query = query.contains('tags', [tag]);
        }

        if (search) {
            query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
        }

        const { data, error } = await query;

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Get Notes Error:', error);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
};

export const createNote = async (req, res) => {
    const { title, content, tags, is_pinned } = req.body;
    const userId = req.user.id;

    try {
        const insertData = { title, content, tags, is_pinned, user_id: userId, subject: 'General' };
        
        const { data, error } = await supabaseAdmin
            .from('notes')
            .insert([insertData])
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (error) {
        console.error('Create Note Error:', error);
        res.status(500).json({ error: 'Failed to create note' });
    }
};

export const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, content, tags, is_pinned } = req.body;
    const userId = req.user.id;

    try {
        const { data, error } = await supabaseAdmin
            .from('notes')
            .update({ title, content, tags, is_pinned, subject: 'General' })
            .eq('id', id)
            .eq('user_id', userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (error) {
        console.error('Update Note Error:', error);
        res.status(500).json({ error: 'Failed to update note' });
    }
};

export const deleteNote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        const { error } = await supabaseAdmin
            .from('notes')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;
        res.status(204).end();
    } catch (error) {
        console.error('Delete Note Error:', error);
        res.status(500).json({ error: 'Failed to delete note' });
    }
};
