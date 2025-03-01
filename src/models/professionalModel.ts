import mongoose, { mongo } from "mongoose";

const ProfessionalSchema = new mongoose.Schema({
  name: {type: String, require: true},
  specialty: [String],
})

export default mongoose.model("Professional", ProfessionalSchema)