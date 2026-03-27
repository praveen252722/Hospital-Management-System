import express from 'express';
import Billing from '../models/Billing.js';

const router = express.Router();

// Get all billing records
router.get('/', async (req, res) => {
  try {
    const billing = await Billing.find().sort({ createdAt: -1 });
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get billing summary
router.get('/summary', async (req, res) => {
  try {
    const totalRevenue = await Billing.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const pendingPayments = await Billing.aggregate([
      { $match: { status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    
    const totalRecords = await Billing.countDocuments();
    const paidRecords = await Billing.countDocuments({ status: 'paid' });
    const pendingRecords = await Billing.countDocuments({ status: 'pending' });
    
    res.json({
      totalRevenue: totalRevenue[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      totalRecords,
      paidRecords,
      pendingRecords
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single billing record
router.get('/:id', async (req, res) => {
  try {
    const billing = await Billing.findById(req.params.id);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.json(billing);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create billing record
router.post('/', async (req, res) => {
  try {
    const billing = new Billing(req.body);
    const savedBilling = await billing.save();
    res.status(201).json(savedBilling);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update billing record
router.put('/:id', async (req, res) => {
  try {
    const billing = await Billing.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.json(billing);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete billing record
router.delete('/:id', async (req, res) => {
  try {
    const billing = await Billing.findByIdAndDelete(req.params.id);
    if (!billing) {
      return res.status(404).json({ message: 'Billing record not found' });
    }
    res.json({ message: 'Billing record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
