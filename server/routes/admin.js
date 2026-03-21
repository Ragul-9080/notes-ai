import express from 'express';
import { adminLogin, listAllUsers, updateUserPlan, deleteUser } from '../controllers/adminController.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';

const router = express.Router();

// Public route for admin login
router.post('/login', adminLogin);

// Protected admin routes
router.use(adminMiddleware);

router.get('/users', listAllUsers);
router.post('/update-plan', updateUserPlan);
router.delete('/users/:userId', deleteUser);

export default router;
