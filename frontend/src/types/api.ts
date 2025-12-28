// API Response Types

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: "CLIENT" | "FREELANCER";
}

export interface LoginResponse {
  token: string;
}

export interface Role {
  id: number;
  name: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullName: string;
  roles: Role[];
}

export interface UserUpdateRequest {
  fullName?: string;
  password?: string;
}

// Job Types
export interface Job {
  id: number;
  title: string;
  description: string;
  budget?: number;
  budgetType?: "FIXED" | "HOURLY";
  deadline?: string;
  status: string;
  clientId: number;
  categoryId?: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobCreateRequest {
  title: string;
  description: string;
  budget?: number;
  budgetType?: "FIXED" | "HOURLY";
  deadline?: string;
  categoryId?: number;
  skillIds?: number[];
}

// Bid Types
export interface Bid {
  id: number;
  jobId: number;
  freelancerId: number;
  amount: number;
  proposal: string;
  status: string;
  estimatedCompletionDate?: string;
  createdAt: string;
}

export interface BidCreateRequest {
  jobId: number;
  amount: number;
  proposal: string;
  estimatedCompletionDate?: string;
}

// Project Types
export interface Project {
  id: number;
  jobId: number;
  clientId: number;
  freelancerId: number;
  title: string;
  description: string;
  status: string;
  budget: number;
  deadline?: string;
  createdAt: string;
}

// Invoice Types
export interface Invoice {
  id: number;
  projectId: number;
  invoiceNumber: string;
  totalAmount: number;
  status: string;
  dueDate?: string;
  paidAt?: string;
  createdAt: string;
}

// Payment Types
export interface Payment {
  id: number;
  invoiceId: number;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt?: string;
  createdAt: string;
}

export interface PaymentInitiateRequest {
  gateway: "KHALTI" | "ESEWA";
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PaymentInitiationResponse {
  success: boolean;
  paymentUrl?: string;
  transactionId?: string;
  message?: string;
}

export interface PaymentVerificationResponse {
  success: boolean;
  verified: boolean;
  message?: string;
}

// Profile Types
export interface ClientProfile {
  id: number;
  userId: number;
  companyName?: string;
  description?: string;
  verificationStatus: string;
}

export interface FreelancerProfile {
  id: number;
  userId: number;
  bio?: string;
  hourlyRate?: number;
  skills?: string[];
  verificationStatus: string;
}

