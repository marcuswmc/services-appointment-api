import mongoose, { Schema, Document } from "mongoose";

export interface IService extends Document {
  name: string;
  description: string;
  price: number;
  duration: number;
}

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
});

export default mongoose.model<IService>("Service", ServiceSchema);
