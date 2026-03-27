import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  patientName: {
    type: String,
    required: true
  },
  visitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Visit'
  },
  amount: {
    type: Number,
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ['paid', 'pending'],
    default: 'pending'
  },
  paymentDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Billing', billingSchema);
