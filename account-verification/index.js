import express from 'express';
import { tolbelAccountVerificationMiddleware } from '../controller/index.js';

const router = express.Router();

// sign user in
router.post('/', tolbelAccountVerificationMiddleware);

export default router;
