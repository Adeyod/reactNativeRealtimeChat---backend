import mongoose, { Schema } from 'mongoose';

const tokenSchema = new mongoose.Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'user' },
    token: { type: String, required: true },
    createdAt: { type: Date, Default: Date.now, expires: 1800 },
  },
  { timestamps: true }
);

const Token = mongoose.model('Token', tokenSchema);
export default Token;
