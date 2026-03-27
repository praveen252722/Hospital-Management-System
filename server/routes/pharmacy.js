import express from 'express';
import Pharmacy from '../models/Pharmacy.js';

const router = express.Router();

// Get all pharmacy inventory
router.get('/', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.find().sort({ createdAt: -1 });
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get pharmacy alerts (low stock & expiring soon)
router.get('/alerts', async (req, res) => {
  try {
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    const lowStock = await Pharmacy.find({ quantity: { $lt: 10 } });
    const expiringSoon = await Pharmacy.find({
      expiryDate: { $lte: thirtyDaysFromNow }
    });
    
    res.json({ lowStock, expiringSoon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single pharmacy item
router.get('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create pharmacy item
router.post('/', async (req, res) => {
  try {
    const pharmacy = new Pharmacy(req.body);
    const savedPharmacy = await pharmacy.save();
    res.status(201).json(savedPharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update pharmacy item
router.put('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    res.json(pharmacy);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete pharmacy item
router.delete('/:id', async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: 'Pharmacy item not found' });
    }
    res.json({ message: 'Pharmacy item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
