import { logInCheckUserMiddleware, updateUserMiddleware, deleteUserAccountMiddleware, getAllFriendRequestsMiddleware, acceptDeclineRequestMiddleware, declinedFriendRequestsMiddleware, uploadProfilePictureMiddleware, getUserProfileMiddleware, getAllConnectedFriendsMiddleware } from '../controller/index.js';
import express from 'express';

const router = express.Router();

// sign user in

router.get('/friend-requests/:userId', getAllFriendRequestsMiddleware);
router.get('/', logInCheckUserMiddleware);
router.get('/profile/:id', getUserProfileMiddleware);
router.get('/all-connected-friends/:userId', getAllConnectedFriendsMiddleware);
router.put('/update', updateUserMiddleware);
router.post('/accept-decline-request', acceptDeclineRequestMiddleware);
router.post('/declined_friend_requests/:id', declinedFriendRequestsMiddleware);
router.post('/upload-profile-picture', uploadProfilePictureMiddleware);

router.delete('/:id', deleteUserAccountMiddleware);

export default router;
