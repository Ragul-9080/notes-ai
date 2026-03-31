import express from 'express';
import { adminLogin, listAllUsers, updateUserPlan, deleteUser, getSettings, updateSettings } from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public route for admin login
router.post('/login', adminLogin);

// Protected admin routes
router.use(adminMiddleware);

router.get('/users', listAllUsers);
router.post('/update-plan', updateUserPlan);
router.delete('/users/:userId', deleteUser);

// App Settings
router.get('/settings', getSettings);
router.post('/update-settings', updateSettings);

export default router;
