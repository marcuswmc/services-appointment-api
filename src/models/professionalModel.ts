import mongoose, { Schema, Document } from "mongoose";

export interface IProfessional extends Document {
  name: string;
  services: mongoose.Types.ObjectId[];
}

const ProfessionalSchema = new Schema({
  name: { type: String, required: true },
  services: [{ type: mongoose.Schema.Types.ObjectId, ref: "Service" }],
});

export default mongoose.model<IProfessional>("Professional", ProfessionalSchema);
