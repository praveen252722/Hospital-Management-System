import express from 'express';
import Visit from '../models/Visit.js';

const router = express.Router();

// Get all visits
router.get('/', async (req, res) => {
  try {
    const visits = await Visit.find().sort({ visitDate: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Search visits
router.get('/search', async (req, res) => {
  try {
    const { name } = req.query;
    const visits = await Visit.find({
      $or: [
        { patientName: { $regex: name, $options: 'i' } },
        { doctorName: { $regex: name, $options: 'i' } }
      ]
    }).sort({ visitDate: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single visit
router.get('/:id', async (req, res) => {
  try {
    const visit = await Visit.findById(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    res.json(visit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create visit
router.post('/', async (req, res) => {
  try {
    const visit = new Visit(req.body);
    const savedVisit = await visit.save();
    res.status(201).json(savedVisit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update visit
router.put('/:id', async (req, res) => {
  try {
    const visit = await Visit.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    res.json(visit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete visit
router.delete('/:id', async (req, res) => {
  try {
    const visit = await Visit.findByIdAndDelete(req.params.id);
    if (!visit) {
      return res.status(404).json({ message: 'Visit not found' });
    }
    res.json({ message: 'Visit deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
