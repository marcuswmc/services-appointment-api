import mongoose, { Schema, Document } from "mongoose";
import { ICategory } from "./categoryModel";

export interface IService extends Document {
  name: string;
  description?: string;
  price: number;
  duration: number;
  category: ICategory["_id"];
}

const ServiceSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: false },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true }
});

export default mongoose.model<IService>("Service", ServiceSchema);
