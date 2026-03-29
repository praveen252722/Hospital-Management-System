import mongoose from "mongoose";

const PatientVisitSchema = new mongoose.Schema(
  {
    patientName: { type: String, required: true },
    phone: { type: String, required: true },
    date: { type: Date, required: true },
    disease: { type: String, required: true },
    paymentMethod: {
      type: String,
      enum: ["Cash", "Card", "UPI", "Insurance"],
      required: true,
    },
    weight: { type: Number, required: true },
    bloodGroup: {
      type: String,
      enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed"],
      default: "pending",
    },
    doctorAssigned: { type: String },
    amount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.models.PatientVisit ||
  mongoose.model("PatientVisit", PatientVisitSchema);
