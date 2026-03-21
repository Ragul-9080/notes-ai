import { supabaseAdmin } from '../lib/supabaseAdmin.js';

export const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = user;
        next();
    } catch (err) {
        console.error('Auth Middleware Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
