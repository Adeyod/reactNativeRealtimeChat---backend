import express from 'express';
import {
  registerUser,
  loginUser,
  verifyUser,
  getAllUserExceptLoggedInUser,
  sendFriendRequest,
  showFriendRequests,
  deleteFriendRequest,
  getFriends,
  getRecipientById,
  sentFriendRequest,
  userFriends,
  logoutUser,
  forgotPassword,
  resetPassword,
} from '../controllers/userController.js';
import multerUpload from '../middleware/multer.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/logout', logoutUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/friend-request', sendFriendRequest);
router.get('/friends/:userId', getFriends);
router.get('/friend-request/sent/:userId', sentFriendRequest);
router.get('/get-friendIds/:userId', userFriends);
router.get('/get-recipient/:recipientId', getRecipientById);
router.post('/delete-friend-request', deleteFriendRequest);
router.get('/show-friend-request/:userId', showFriendRequests);
router.post('/register', multerUpload.single('image'), registerUser);
router.get(
  '/getAllUserExceptLoggedInUser/:userId',
  getAllUserExceptLoggedInUser
);
router.get('/verify-user/:token', verifyUser);

export default router;
