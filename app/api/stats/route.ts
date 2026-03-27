import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    const { db } = await connectToDatabase();

    const [
      totalPatients,
      totalDoctors,
      appointments,
      billing,
      pharmacy,
    ] = await Promise.all([
      db.collection('patients').countDocuments(),
      db.collection('doctors').countDocuments(),
      db.collection('appointments').find().toArray(),
      db.collection('billing').find().toArray(),
      db.collection('pharmacy').find().toArray(),
    ]);

    // Appointment stats
    const appointmentStats = {
      total: appointments.length,
      scheduled: appointments.filter((a) => a.status === 'scheduled').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };

    // Billing summary
    const billingSummary = {
      totalRevenue: billing.filter((b) => b.status === 'paid').reduce((sum, b) => sum + (b.amount || 0), 0),
      pendingPayments: billing.filter((b) => b.status === 'pending').reduce((sum, b) => sum + (b.amount || 0), 0),
      totalRecords: billing.length,
      paidRecords: billing.filter((b) => b.status === 'paid').length,
      pendingRecords: billing.filter((b) => b.status === 'pending').length,
    };

    // Pharmacy alerts
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const pharmacyAlerts = {
      lowStock: pharmacy.filter((m) => m.quantity < 10),
      expiringSoon: pharmacy.filter((m) => {
        const expiryDate = new Date(m.expiryDate);
        return expiryDate <= thirtyDaysFromNow && expiryDate >= today;
      }),
    };

    return NextResponse.json({
      totalPatients,
      totalDoctors,
      appointmentStats,
      billingSummary,
      pharmacyAlerts,
    });
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    return NextResponse.json({ message: 'Failed to fetch stats' }, { status: 500 });
  }
}
