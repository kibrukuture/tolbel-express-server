import express from 'express';
import cors from 'cors';
import signInRouter from './signin/index.js';
import signUpRouter from './signup/index.js';
import searchRouter from './search/index.js';
import userRouter from './user/index.js';
import tolbelAccountVerificationRouter from './account-verification/index.js';
import tolbelAccountVerificationRouterByUrl from './account-verification/verifyByUrl.js';
import chatLoadRouter from './dataloader/index.js';
import openGraphScrapperRouter from './opengraphscrapper/index.js';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

dotenv.config();

console.log('process.env.NODE_ENV', process.env.TRANSPORTER_AUTH_MAIL);

export const app = express();

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// app.use(cors({

app.use(
  cors({
    origin: getAllowOrigin(),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // allowedHeaders: ['Content-Type', 'Authorization'],
    // credentials: true,
  }),
);
// increase file upload limit to 50mb
// app.use(bodyparser.json({ limit: '50mb' }));
// app.use(bodyparser.urlencoded({ limit: '50mb', extended: true }));

app.use('/signin', signInRouter);
app.use('/signup', signUpRouter);
app.use('/api/search', searchRouter);
app.use('/api/user', userRouter);
app.use('/api/loadchats', chatLoadRouter);
app.use('/api/opengraphscrapper', openGraphScrapperRouter);
app.use('/api/tolbel-account-verification', tolbelAccountVerificationRouter);
app.use('/api/tolbel-account-verification-by-url', tolbelAccountVerificationRouterByUrl);

//####################################### allow #########################
export function getAllowOrigin() {
  return process.env.NODE_ENV === 'production' ? process.env.REMOTE_ALLOW_ORIGIN : process.env.DEV_ALLOW_ORIGIN;
}
