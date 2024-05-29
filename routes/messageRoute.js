import express from 'express';
import {
  postMessage,
  deleteMessages,
  getMessagesBetweenTwoUsers,
} from '../controllers/messageController.js';
import multerUpload from '../middleware/multer.js';

const router = express.Router();

router.get('/get-messages/:senderId/:recipientId', getMessagesBetweenTwoUsers);
router.post('/post-text', multerUpload.single('imageUrl'), postMessage);
router.post('/delete-messages', deleteMessages);
// router.post('/post/image', multerUpload.single('image'), postMessage);
export default router;
