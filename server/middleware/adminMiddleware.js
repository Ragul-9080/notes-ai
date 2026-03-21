import dotenv from 'dotenv';
dotenv.config();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const ADMIN_TOKEN_SECRET = Buffer.from(ADMIN_PASSWORD).toString('base64');

export const adminMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Missing or invalid admin authorization' });
    }

    const token = authHeader.split(' ')[1];

    if (token === ADMIN_TOKEN_SECRET) {
        return next();
    }

    res.status(403).json({ error: 'Forbidden: Invalid admin token' });
};
