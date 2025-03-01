import mongoose from "mongoose"

export interface IUser extends mongoose.Document {
  name: string;
  price: string;
  duration: number;
  availableHours: [string],
}

const ServiceSchema = new mongoose.Schema({
  name: { type: String, require: true },
  price: {type: Number, require: true },
  duration: {type: Number, require: true },
  availableHours: {type: [String], require: true },
});

export default mongoose.model("Service", ServiceSchema)