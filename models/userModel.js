import mongoose, { Schema } from 'mongoose';

const userImage = {
  publicId: String,
  signature: String,
  url: String,
  assetId: String,
};

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    image: { type: userImage, required: true },
    friendRequest: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    sentFriendRequest: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

const User = mongoose.model('User', userSchema);
export default User;
