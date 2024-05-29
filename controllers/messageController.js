import { uploadFile } from '../middleware/cloudinary.js';
import Message from '../models/messageModel.js';
import User from '../models/userModel.js';

const postMessage = async (req, res) => {
  try {
    const { senderId, recipientId, messageType, message } = req.body;
    const imageUrl = req.file;

    const findSender = await User.findById({ _id: senderId });
    if (!findSender) {
      return res.json({
        error: "couldn't find sender",
        success: false,
        status: 404,
      });
    }

    const findRecipient = await User.findById({ _id: recipientId });

    if (!findRecipient) {
      return res.json({
        error: "couldn't find recipient",
        success: false,
        status: 404,
      });
    }

    // let uploadedImageObject = null;

    if (imageUrl) {
      const result = await uploadFile(req, res);

      const newMessage = await new Message({
        senderId,
        recipientId,
        messageType,
        message,
        image: result,
      }).save();

      return res.json({
        message: 'image sent successfully',
        success: true,
        status: 200,
        sentMessage: newMessage,
      });
    } else {
      const newMessage = await new Message({
        senderId,
        recipientId,
        messageType,
        message,
        image: null,
      }).save();

      return res.json({
        message: 'message sent successfully',
        success: true,
        status: 200,
        sentMessage: newMessage,
      });
    }
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
    });
  }
};

const getMessagesBetweenTwoUsers = async (req, res) => {
  try {
    const { senderId, recipientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recipientId: recipientId },
        { senderId: recipientId, recipientId: senderId },
      ],
    }).populate('senderId', '_id name');

    if (!messages) {
      return res.json({
        error: 'No messages found for these users',
        success: false,
        status: 404,
      });
    }

    return res.json({
      message: 'Messages fetched successfully',
      status: 200,
      success: true,
      messages,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
    });
  }
};

const deleteMessages = async (req, res) => {
  try {
    const { messages } = req.body;
    console.log(messages);
    if (!Array.isArray(messages || messages.length === 0)) {
      return res.json({
        error: 'Invalid parameters sent to the server.',
        status: 400,
        success: false,
      });
    }

    const deletedMessages = await Message.deleteMany({
      _id: { $in: messages },
    });

    if (!deletedMessages) {
      return res.json({
        error: 'Unable to delete messages',
        status: 400,
        success: false,
      });
    }

    return res.json({
      message: 'Messages deleted successfully',
      success: true,
      status: 200,
      deletedMessages,
    });
  } catch (error) {
    return res.json({
      error: error.message,
      status: 500,
      success: false,
    });
  }
};

// const postMessage = async(req, res)=>{
//   try {

//   } catch (error) {
//     return res.json({
//       error: error.message,
//       status: 500,
//       success: false
//     })
//   }
// }

export { deleteMessages, postMessage, getMessagesBetweenTwoUsers };
