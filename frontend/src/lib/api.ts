import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from "axios";
import { toast } from "sonner";

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add JWT token to requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("jwt_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data as any;

      // Handle 401 - Unauthorized
      if (status === 401) {
        localStorage.removeItem("jwt_token");
        // Only redirect if not already on login/register page and not on public pages
        const isPublicPage = window.location.pathname.startsWith("/jobs") || 
                            window.location.pathname === "/" ||
                            window.location.pathname.startsWith("/about") ||
                            window.location.pathname.startsWith("/contact") ||
                            window.location.pathname.startsWith("/pricing");
        
        if (!window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/register") &&
            !isPublicPage) {
          // For protected pages, redirect to login
          window.location.href = "/login";
        } else if (isPublicPage) {
          // For public pages, just remove token silently - user can continue browsing
          // Don't redirect or show error
        }
        // Only show error toast for protected pages
        if (!isPublicPage && !window.location.pathname.includes("/login") && 
            !window.location.pathname.includes("/register")) {
          toast.error("Session expired. Please login again.");
        }
      } else if (status === 403) {
        toast.error("Access denied. You don't have permission.");
      } else if (status === 404) {
        toast.error("Resource not found.");
      } else if (status >= 500) {
        toast.error("Server error. Please try again later.");
      } else {
        // Show error message from server if available
        const message = data?.message || data?.error || "An error occurred";
        toast.error(message);
      }
    } else if (error.request) {
      toast.error("Network error. Please check your connection.");
    } else {
      toast.error("An unexpected error occurred.");
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post<{ token: string }>("/auth/login", { email, password });
    return response.data;
  },

  register: async (email: string, password: string, fullName: string, role?: "CLIENT" | "FREELANCER") => {
    const response = await api.post<{ token: string }>("/auth/register", {
      email,
      password,
      fullName,
      role,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<{
      id: number;
      email: string;
      fullName: string;
      roles: Array<{ id: number; name: string }>;
    }>("/auth/me");
    return response.data;
  },

  updateProfile: async (data: { fullName?: string; password?: string }) => {
    const response = await api.put<{
      id: number;
      email: string;
      fullName: string;
      roles: Array<{ id: number; name: string }>;
    }>("/auth/me", data);
    return response.data;
  },
};

// Jobs API
export const jobsApi = {
  list: async (params?: {
    clientId?: number;
    status?: string;
    categoryId?: number;
    featured?: boolean;
  }) => {
    const response = await api.get<Array<{
      id: number;
      title: string;
      description: string;
      budget?: number;
      budgetType?: string;
      deadline?: string;
      status: string;
      clientId: number;
      categoryId?: number;
      createdAt: string;
    }>>("/jobs", { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<{
      id: number;
      title: string;
      description: string;
      budget?: number;
      budgetType?: string;
      deadline?: string;
      status: string;
      clientId: number;
      categoryId?: number;
      createdAt: string;
    }>(`/jobs/${id}`);
    return response.data;
  },

  create: async (data: {
    title: string;
    description: string;
    budget?: number;
    budgetType?: "FIXED" | "HOURLY";
    deadline?: string;
    categoryId?: number;
    skillIds?: number[];
  }) => {
    const response = await api.post<{
      id: number;
      title: string;
      description: string;
      budget?: number;
      budgetType?: string;
      deadline?: string;
      status: string;
      clientId: number;
      createdAt: string;
    }>("/jobs", data);
    return response.data;
  },

  update: async (id: number, data: Partial<{
    title: string;
    description: string;
    budget?: number;
    budgetType?: "FIXED" | "HOURLY";
    deadline?: string;
    status?: string;
  }>) => {
    const response = await api.put(`/jobs/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/jobs/${id}`);
  },
};

// Bids API
export const bidsApi = {
  list: async (params?: {
    jobId?: number;
    freelancerId?: number;
    status?: string;
  }) => {
    const response = await api.get<Array<{
      id: number;
      jobId: number;
      freelancerId: number;
      amount: number;
      proposal: string;
      status: string;
      estimatedCompletionDate?: string;
      createdAt: string;
    }>>("/bids", { params });
    return response.data;
  },

  listByJob: async (jobId: number) => {
    const response = await api.get<Array<{
      id: number;
      jobId: number;
      freelancerId: number;
      amount: number;
      message?: string;
      proposal?: string;
      status: string;
      createdAt: string;
    }>>(`/jobs/${jobId}/bids`);
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<{
      id: number;
      jobId: number;
      freelancerId: number;
      amount: number;
      proposal: string;
      status: string;
      estimatedCompletionDate?: string;
      createdAt: string;
    }>(`/bids/${id}`);
    return response.data;
  },

  create: async (data: {
    jobId: number;
    amount: number;
    proposal: string;
    estimatedCompletionDate?: string;
  }) => {
    const response = await api.post<{
      id: number;
      jobId: number;
      freelancerId: number;
      amount: number;
      proposal: string;
      status: string;
      createdAt: string;
    }>("/bids", data);
    return response.data;
  },

  accept: async (id: number) => {
    const response = await api.put(`/bids/${id}/accept`);
    return response.data;
  },
};

// Projects API
export const projectsApi = {
  list: async (params?: {
    clientId?: number;
    freelancerId?: number;
    status?: string;
  }) => {
    const response = await api.get<Array<{
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
    }>>("/projects", { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<{
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
    }>(`/projects/${id}`);
    return response.data;
  },

  acceptBid: async (bidId: number, data: { title: string; description?: string }) => {
    const response = await api.post<{
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
    }>(`/projects/accept-bid/${bidId}`, data);
    return response.data;
  },

  // Tasks
  getTasks: async (projectId: number) => {
    const response = await api.get<Array<{
      id: number;
      projectId: number;
      title: string;
      description?: string;
      status: string;
      priority?: string;
      dueDate?: string;
      milestoneId?: number;
      assigneeId?: number;
      estimatedHours?: number;
    }>>(`/projects/${projectId}/tasks`);
    return response.data;
  },

  createTask: async (projectId: number, data: {
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    dueDate?: string;
    milestoneId?: number;
    assigneeId?: number;
    estimatedHours?: number;
  }) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  updateTaskStatus: async (projectId: number, taskId: number, status: string) => {
    const response = await api.patch(`/projects/${projectId}/tasks/${taskId}/status`, { status });
    return response.data;
  },

  // Milestones
  getMilestones: async (projectId: number) => {
    const response = await api.get<Array<{
      id: number;
      projectId: number;
      title: string;
      dueDate?: string;
      status?: string;
    }>>(`/projects/${projectId}/milestones`);
    return response.data;
  },

  // Subtasks
  getSubtasks: async (taskId: number) => {
    const response = await api.get<Array<{
      id: number;
      taskId: number;
      title: string;
      completed: boolean;
    }>>(`/tasks/${taskId}/subtasks`);
    return response.data;
  },

  // Messages (for project chat)
  getMessages: async (conversationId: number, page: number = 0, size: number = 50) => {
    const response = await api.get<Array<{
      id: number;
      conversationId: number;
      senderId: number;
      content: string;
      createdAt: string;
    }>>(`/conversations/${conversationId}/messages`, { params: { page, size } });
    return response.data;
  },

  sendMessage: async (conversationId: number, data: {
    content?: string;
    richContent?: string;
    attachmentIds?: number[];
  }) => {
    const response = await api.post(`/conversations/${conversationId}/messages`, data);
    return response.data;
  },
};

// Invoices API
export const invoicesApi = {
  list: async (params?: {
    clientId?: number;
    freelancerId?: number;
    projectId?: number;
    status?: string;
  }) => {
    const response = await api.get<Array<{
      id: number;
      projectId: number;
      invoiceNumber: string;
      totalAmount: number;
      status: string;
      dueDate?: string;
      paidAt?: string;
      createdAt: string;
    }>>("/invoices", { params });
    return response.data;
  },

  get: async (id: number) => {
    const response = await api.get<{
      id: number;
      projectId: number;
      invoiceNumber: string;
      totalAmount: number;
      status: string;
      dueDate?: string;
      paidAt?: string;
      createdAt: string;
    }>(`/invoices/${id}`);
    return response.data;
  },
};

// Payments API
export const paymentsApi = {
  create: async (data: {
    invoiceId: number;
    amount: number;
    paymentMethod: string;
    paymentReference?: string;
    status?: string;
    notes?: string;
  }) => {
    const response = await api.post<{
      id: number;
      invoiceId: number;
      amount: number;
      paymentMethod: string;
      status: string;
      createdAt: string;
    }>("/payments", data);
    return response.data;
  },

  initiate: async (paymentId: number, gateway: "KHALTI" | "ESEWA", returnUrl?: string, cancelUrl?: string) => {
    const response = await api.post<{
      success: boolean;
      paymentUrl?: string;
      transactionId?: string;
      message?: string;
    }>(`/payments/${paymentId}/initiate`, {
      gateway,
      returnUrl: returnUrl || `${window.location.origin}/success?type=payment`,
      cancelUrl: cancelUrl || `${window.location.origin}/failure?type=payment`,
    });
    return response.data;
  },

  verify: async (transactionId: string) => {
    const response = await api.post<{
      success: boolean;
      verified: boolean;
      message?: string;
    }>(`/payments/verify/${transactionId}`);
    return response.data;
  },

  getByInvoice: async (invoiceId: number) => {
    const response = await api.get<Array<{
      id: number;
      invoiceId: number;
      amount: number;
      paymentMethod: string;
      status: string;
      paidAt?: string;
      createdAt: string;
    }>>(`/payments/invoice/${invoiceId}`);
    return response.data;
  },
};

// Admin API
export const adminApi = {
  // Analytics
  getOverview: async () => {
    const response = await api.get<{
      totalUsers: number;
      totalJobs: number;
      totalBids: number;
      totalProjects: number;
      totalTasks: number;
    }>("/admin/analytics/overview");
    return response.data;
  },

  getPaymentDashboard: async () => {
    const response = await api.get<{
      summary: {
        totalCollected: number;
        pendingAmount: number;
        refundedAmount: number;
        averageTicketSize: number;
        totalTransactions: number;
      };
      gateways: Array<{
        gateway: string;
        count: number;
        totalAmount: number;
      }>;
      statuses: Array<{
        status: string;
        count: number;
      }>;
      recentPayments: Array<{
        id: number;
        amount: number;
        status: string;
        gateway: string;
        invoiceNumber?: string;
        clientName?: string;
        freelancerName?: string;
        createdAt: string;
      }>;
      disputes: {
        total: number;
        open: number;
        resolved: number;
      };
      recentDisputes: Array<{
        id: number;
        amount: number;
        status: string;
        createdAt: string;
      }>;
    }>("/admin/payments/dashboard");
    return response.data;
  },

  // Users
  getUsers: async (page: number = 0, size: number = 20) => {
    const response = await api.get<{
      content: Array<{
        id: number;
        email: string;
        fullName: string;
        roles: Array<{ id: number; name: string }>;
        createdAt?: string;
      }>;
      totalElements: number;
      totalPages: number;
      number: number;
      size: number;
    }>("/admin/users", { params: { page, size } });
    return response.data;
  },

  getUser: async (id: number) => {
    const response = await api.get<{
      id: number;
      email: string;
      fullName: string;
      roles: Array<{ id: number; name: string }>;
      createdAt?: string;
    }>(`/admin/users/${id}`);
    return response.data;
  },

  createUser: async (data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
  }) => {
    const response = await api.post<{
      id: number;
      email: string;
      fullName: string;
      roles: Array<{ id: number; name: string }>;
    }>("/admin/users", data);
    return response.data;
  },

  updateUser: async (id: number, data: {
    email?: string;
    password?: string;
    fullName?: string;
    role?: string;
  }) => {
    const response = await api.put<{
      id: number;
      email: string;
      fullName: string;
      roles: Array<{ id: number; name: string }>;
    }>(`/admin/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: number) => {
    await api.delete(`/admin/users/${id}`);
  },

  getRoles: async () => {
    const response = await api.get<Array<{
      id: number;
      name: string;
    }>>("/admin/users/roles");
    return response.data;
  },

  // Verification Queue
  getPendingProfiles: async () => {
    const response = await api.get<Array<{
      profileId: number;
      profileType: string;
      userId: number;
      userName: string;
      userEmail: string;
      submittedAt?: string;
      status: string;
    }>>("/admin/profiles/pending");
    return response.data;
  },

  getFreelancerProfile: async (id: number) => {
    const response = await api.get<{
      id: number;
      userId: number;
      bio?: string;
      hourlyRate?: number;
      location?: string;
      phone?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      verificationStatus: string;
      submittedAt?: string;
    }>(`/admin/profiles/freelancer/${id}`);
    return response.data;
  },

  getFreelancerDocuments: async (id: number) => {
    const response = await api.get<Array<{
      id: number;
      documentType: string;
      fileName: string;
      fileUrl: string;
      uploadedAt: string;
    }>>(`/admin/profiles/freelancer/${id}/documents`);
    return response.data;
  },

  reviewProfile: async (profileId: number, data: {
    profileType: "FREELANCER" | "CLIENT";
    decision: "APPROVED" | "REJECTED" | "NEEDS_UPDATE";
    verificationNotes?: string;
    rejectionReason?: string;
  }) => {
    const response = await api.post(`/admin/profiles/${profileId}/review`, data);
    return response.data;
  },

  // Payments Dashboard
  getPaymentDashboard: async () => {
    const response = await api.get<{
      summary: {
        totalCollected: number;
        pendingAmount: number;
        refundedAmount: number;
        averageTicketSize: number;
        totalTransactions: number;
      };
      gateways: Array<{
        gateway: string;
        count: number;
        totalAmount: number;
      }>;
      statuses: Array<{
        status: string;
        count: number;
      }>;
      recentPayments: Array<{
        id: number;
        amount: number;
        status: string;
        gateway: string;
        invoiceNumber?: string;
        clientName?: string;
        freelancerName?: string;
        createdAt: string;
      }>;
      disputes: {
        total: number;
        open: number;
        resolved: number;
      };
      recentDisputes: Array<any>;
    }>("/admin/payments/dashboard");
    return response.data;
  },
};

// Profile API
export const profileApi = {
  // Freelancer Profile
  getFreelancerProfile: async () => {
    const response = await api.get<{
      id: number;
      userId: number;
      bio?: string;
      hourlyRate?: number;
      location?: string;
      phone?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      verificationStatus: string;
    }>("/profile/freelancer/me");
    return response.data;
  },

  updateFreelancerProfile: async (data: {
    bio?: string;
    hourlyRate?: number;
    location?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  }) => {
    const response = await api.put<{
      id: number;
      userId: number;
      bio?: string;
      hourlyRate?: number;
      location?: string;
      phone?: string;
      website?: string;
      linkedin?: string;
      github?: string;
      verificationStatus: string;
    }>("/profile/freelancer", data);
    return response.data;
  },

  // Client Profile
  getClientProfile: async () => {
    const response = await api.get<{
      id: number;
      userId: number;
      companyName?: string;
      companyDescription?: string;
      location?: string;
      phone?: string;
      website?: string;
      verificationStatus: string;
    }>("/profile/client/me");
    return response.data;
  },

  updateClientProfile: async (data: {
    companyName?: string;
    companyDescription?: string;
    location?: string;
    phone?: string;
    website?: string;
  }) => {
    const response = await api.put<{
      id: number;
      userId: number;
      companyName?: string;
      companyDescription?: string;
      location?: string;
      phone?: string;
      website?: string;
      verificationStatus: string;
    }>("/profile/client", data);
    return response.data;
  },
};

// Export the axios instance for custom requests
export default api;

