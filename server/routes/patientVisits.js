import express from "express";
import mongoose from "mongoose";
import PatientVisit from "../models/PatientVisit.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const patients = await PatientVisit.find().sort({ createdAt: -1 });
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: "Error fetching patients", error });
  }
});

router.post("/", async (req, res) => {
  try {
    const patient = new PatientVisit(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error creating patient visit", error });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientVisit.findByIdAndUpdate(id, req.body, { new: true });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error updating patient visit", error });
  }
});

router.patch("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const patient = await PatientVisit.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Error updating status", error });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await PatientVisit.findByIdAndDelete(id);
    res.json({ message: "Patient visit deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting patient visit", error });
  }
});

router.get("/stats", async (req, res) => {
  try {
    const total = await PatientVisit.countDocuments();
    const pending = await PatientVisit.countDocuments({ status: "pending" });
    const inProgress = await PatientVisit.countDocuments({ status: "in-progress" });
    const completed = await PatientVisit.countDocuments({ status: "completed" });
    const totalAmount = await PatientVisit.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    res.json({
      total,
      pending,
      inProgress,
      completed,
      totalRevenue: totalAmount[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error });
  }
});

export default router;
