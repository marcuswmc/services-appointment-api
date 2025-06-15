import mongoose, { Schema, Document } from "mongoose";

export interface IProfessional extends Document {
  name: string;
  services: mongoose.Types.ObjectId[];
   image?: string;
}

const ProfessionalSchema = new Schema({
  name: { type: String, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
  image: { type: String },
});

export default mongoose.model<IProfessional>("Professional", ProfessionalSchema);
