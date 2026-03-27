import mongoose from 'mongoose';

const pharmacySchema = new mongoose.Schema({
  medicineName: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  expiryDate: {
    type: Date,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  supplier: {
    type: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Pharmacy', pharmacySchema);
