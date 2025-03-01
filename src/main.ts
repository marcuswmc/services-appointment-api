import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter';


dotenv.config();

const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: '*',
  })
)
app.use(express.json())
app.use('/api', userRouter);

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(String(process.env.MONGO_URI));
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      if (process.env.NODE_ENV === 'prod') {
        console.log(`Server is running in production mode on port ${PORT}`);
      } else {
        console.log(`Server is running in development mode on port ${PORT}`);
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error('Error connecting to database', err.message);
    }
  }
};

connectDB()
