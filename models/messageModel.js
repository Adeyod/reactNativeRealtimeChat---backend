import mongoose, { Schema } from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: Schema.Types.ObjectId, ref: 'User' },
    recipientId: { type: Schema.Types.ObjectId, ref: 'User' },
    messageType: { type: String, email: ['text', 'image'] },
    message: { type: String },
    image: {
      url: String,
      assetId: String,
      publicId: String,
      signature: String,
    },
  },
  { timestamps: true }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
