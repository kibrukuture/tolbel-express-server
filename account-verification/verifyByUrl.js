///api/tolbel-account-verification-by-url
import express from 'express';
import { tolbelAccountVerificationByUrlMiddleware } from '../controller/index.js';

const router = express.Router();

// sign user in
router.post('/', tolbelAccountVerificationByUrlMiddleware);

export default router;
