import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';

export const useNotes = (filters = {}) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchNotes = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/notes', { params: filters });
            setNotes(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const createNote = async (noteData) => {
        const { data } = await api.post('/notes', noteData);
        setNotes(prev => [data, ...prev]);
        return data;
    };

    const updateNote = async (id, noteData) => {
        const { data } = await api.put(`/notes/${id}`, noteData);
        setNotes(prev => prev.map(n => n.id === id ? data : n));
        return data;
    };

    const deleteNote = async (id) => {
        await api.delete(`/notes/${id}`);
        setNotes(prev => prev.filter(n => n.id !== id));
    };

    return { notes, loading, error, fetchNotes, createNote, updateNote, deleteNote };
};
