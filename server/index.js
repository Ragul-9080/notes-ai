import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import notesRoutes from './routes/notes.js';
import aiRoutes from './routes/ai.js';
import subscriptionRoutes from './routes/subscription.js';
import adminRoutes from './routes/admin.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
console.log('Attempting to start server on port:', PORT);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notes', notesRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);

// Simple Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Server restarted with stable dependencies
