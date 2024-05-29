import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

export const DBConfig = mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log(
      `MongoDB connected successfully with ${mongoose.connection.host}`.green
    );
  })
  .catch((error) => {
    console.log('MongoDB connection error: ' + error.red);
    process.exit(1);
  });
