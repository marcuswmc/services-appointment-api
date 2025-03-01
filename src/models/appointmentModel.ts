import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  date: string;
  time: string;
  status: "PENDING" | "CONFIRMED" | "CANCELED";
}

const AppointmentSchema = new Schema({
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  serviceId: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
  professionalId: { type: mongoose.Schema.Types.ObjectId, ref: "Professional", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ["PENDING", "CONFIRMED", "CANCELED"], default: "CONFIRMED" },
});

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);
