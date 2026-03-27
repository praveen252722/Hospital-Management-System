const API_BASE_URL = '/api';

export async function fetchAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  const response = await fetch(url, config);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'An error occurred');
  }
  
  return response.json();
}

// Auth helpers
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('adminToken', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('adminToken');
}

export async function fetchWithAuth<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  
  return fetchAPI<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  });
}

// Type definitions
export interface Patient {
  _id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  email?: string;
  address?: string;
  disease?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialization: string;
  phone: string;
  email?: string;
  availability: string;
  createdAt: string;
}

export interface Appointment {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Visit {
  _id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  visitDate: string;
  disease?: string;
  prescription?: string;
  notes?: string;
  createdAt: string;
}

export interface Billing {
  _id: string;
  patientId: string;
  patientName: string;
  visitId?: string;
  amount: number;
  description?: string;
  status: 'paid' | 'pending';
  paymentDate?: string;
  createdAt: string;
}

export interface Pharmacy {
  _id: string;
  medicineName: string;
  quantity: number;
  expiryDate: string;
  price: number;
  supplier?: string;
  createdAt: string;
}

export interface AppointmentStats {
  total: number;
  scheduled: number;
  completed: number;
  cancelled: number;
}

export interface BillingSummary {
  totalRevenue: number;
  pendingPayments: number;
  totalRecords: number;
  paidRecords: number;
  pendingRecords: number;
}

export interface PharmacyAlerts {
  lowStock: Pharmacy[];
  expiringSoon: Pharmacy[];
}

export interface Admin {
  id: string;
  email: string;
  name: string;
}
