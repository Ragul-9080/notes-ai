import express from 'express';
import { signup, verifyOtp } from '../controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/verify', verifyOtp);

export default router;
