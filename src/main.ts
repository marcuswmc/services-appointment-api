import express from 'express';
import 'dotenv/config';
import cors from 'cors';
import mongoose from 'mongoose';
import userRouter from './routers/userRouter';
import servicesRoutes from'./routers/servicesRoutes'
import professionalRoutes from'./routers/professionalRoutes'
import appointmentRoutes from'./routers/appointmentRoutes'
import categoryRoutes from './routers/categoryRoutes';
import availabilityRoutes from './routers/availabilityRoutes';


const PORT = process.env.PORT || 5000;

const app = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(express.json())
app.use('/api', userRouter);
app.use('/api', appointmentRoutes);
app.use('/api', servicesRoutes);
app.use('/api', professionalRoutes);
app.use('/api', categoryRoutes);
app.use('/api', availabilityRoutes);

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
