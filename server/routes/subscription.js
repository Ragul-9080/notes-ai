import express from 'express';
import { getSubscriptionStatus, getSubscriptionPrice, createPaymentOrder, verifyPayment } from '../controllers/subscriptionController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for price
router.get('/price', getSubscriptionPrice);

// Protected routes
router.use(authMiddleware);

router.get('/status', getSubscriptionStatus);
router.post('/create-order', createPaymentOrder);
router.post('/verify-payment', verifyPayment);

export default router;
