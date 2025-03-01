import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'USER' },
});

export default mongoose.model<IUser>("User", UserSchema);
