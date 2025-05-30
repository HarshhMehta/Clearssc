import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotTime: { type: String, required: true },
  slotDate: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: Number, required: true },
  message: { type: String, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  // Stripe specific fields
  stripeSessionId: { type: String, default: null },
  paymentIntentId: { type: String, default: null },
  paymentMethod: { type: String, default: 'stripe' }, // 'stripe' or other payment methods
});

const appointmentModel = mongoose.models.appointment || mongoose.model('appointment', appointmentSchema);

export default appointmentModel;