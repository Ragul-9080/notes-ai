import express from 'express';
import { getSubscriptionStatus, upgradeToPro } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/status', getSubscriptionStatus);
router.post('/upgrade', upgradeToPro);

export default router;
