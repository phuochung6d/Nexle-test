import dotenv from 'dotenv';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import appRouter from './routes/index';

dotenv.config();

const app = express();

app.use(cors());
app.use(cookieParser());
app.use([
  bodyParser.json(),
  bodyParser.urlencoded({ extended: true })
]);

app.use('/', appRouter);

app.listen(3000, () => {
  console.log('SERVER IS LISTENING ON PORT 3000');
});