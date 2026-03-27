import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  specialization: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  availability: {
    type: String,
    default: 'Mon-Fri 9AM-5PM'
  }
}, {
  timestamps: true
});

export default mongoose.model('Doctor', doctorSchema);
