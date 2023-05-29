import { signInUserMiddleware } from '../controller/index.js';
import express from 'express';

const router = express.Router();

// sign user in
router.post('/', signInUserMiddleware);

export default router;
