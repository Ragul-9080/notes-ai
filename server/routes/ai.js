import express from 'express';
import multer from 'multer';
import { generateAINote, processPDF, generateVoice, translateNote } from '../controllers/aiController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.use(authMiddleware);

router.post('/generate', generateAINote);
router.post('/generate-from-pdf', upload.single('file'), processPDF);
router.post('/generate-voice', generateVoice);
router.post('/translate', translateNote);

export default router;
