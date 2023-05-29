import express from 'express';
import { userAllChatRoomLoader } from '../controller/index.js';

const router = express.Router();

// on first page load, get all chat rooms
router.get('/:id', userAllChatRoomLoader);

export default router;
