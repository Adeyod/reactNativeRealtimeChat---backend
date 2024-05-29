import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import colors from 'colors';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';

import { DBConfig } from './DBConfig.js';
import userRoute from './routes/userRoute.js';
import messageRoute from './routes/messageRoute.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: '*',
  })
);

app.use('/api/users', userRoute);
app.use('/api/messages', messageRoute);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`.underline);
});
