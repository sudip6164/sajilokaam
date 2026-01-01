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

  update: async (id: number, data: {
    title?: string;
    description?: string;
    status?: string;
  }) => {
    const response = await api.put<{
      id: number;
      title: string;
      description: string;
      status: string;
    }>(`/jobs/${id}`, data);
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

  // New eSewa v2 form-based payment
  initiateESewa: async (amount: number, invoiceId?: number) => {
    const response = await api.post<{
      amount: string;
      tax_amount: number;
      total_amount: string;
      transaction_uuid: string;
      product_code: string;
      product_service_charge: number;
      product_delivery_charge: number;
      success_url: string;
      failure_url: string;
      signed_field_names: string;
      signature: string;
      action: string;
    }>("/payments/esewa", {
      total_amount: amount,
      amount: amount,
    });
    return response.data;
  },

  verifyESewa: async (callbackData: Record<string, any>) => {
    const response = await api.post<{
      status: string;
      message: string;
    }>("/payments/esewa/verify", callbackData);
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
      headline?: string;
      overview?: string;
      hourlyRate?: number;
      hourlyRateMin?: number;
      hourlyRateMax?: number;
      locationCity?: string;
      locationCountry?: string;
      timezone?: string;
      primarySkills?: string;
      secondarySkills?: string;
      languages?: string;
      education?: string;
      certifications?: string;
      portfolioUrl?: string;
      websiteUrl?: string;
      linkedinUrl?: string;
      githubUrl?: string;
      videoIntroUrl?: string;
      availability?: string;
      experienceLevel?: string;
      experienceYears?: number;
      status?: string;
      verificationNotes?: string;
      rejectionReason?: string;
      submittedAt?: string;
      reviewedAt?: string;
      profilePictureUrl?: string;
    }>("/profile/freelancer/me");
    return response.data;
  },

  updateFreelancerProfile: async (data: {
    headline?: string;
    overview?: string;
    hourlyRate?: number;
    hourlyRateMin?: number;
    hourlyRateMax?: number;
    locationCity?: string;
    locationCountry?: string;
    timezone?: string;
    primarySkills?: string;
    secondarySkills?: string;
    languages?: string;
    education?: string;
    certifications?: string;
    portfolioUrl?: string;
    websiteUrl?: string;
    linkedinUrl?: string;
    githubUrl?: string;
    videoIntroUrl?: string;
    availability?: string;
    experienceLevel?: string;
    experienceYears?: number;
    // Legacy fields for backward compatibility
    bio?: string;
    location?: string;
    phone?: string;
    website?: string;
    linkedin?: string;
    github?: string;
  }) => {
    // Build request payload, only including fields that are actually provided
    const payload: any = {};
    
    if (data.headline !== undefined) payload.headline = data.headline;
    if (data.overview !== undefined) payload.overview = data.overview;
    if (data.bio !== undefined && !data.overview) payload.overview = data.bio; // Legacy support
    if (data.hourlyRate !== undefined) payload.hourlyRate = data.hourlyRate;
    if (data.hourlyRateMin !== undefined) payload.hourlyRateMin = data.hourlyRateMin;
    if (data.hourlyRateMax !== undefined) payload.hourlyRateMax = data.hourlyRateMax;
    if (data.locationCity !== undefined) payload.locationCity = data.locationCity;
    if (data.locationCountry !== undefined) payload.locationCountry = data.locationCountry;
    if (data.location !== undefined && !data.locationCity) {
      const parts = data.location.split(",").map(s => s.trim());
      if (parts[0]) payload.locationCity = parts[0];
      if (parts[1]) payload.locationCountry = parts[1];
    }
    if (data.timezone !== undefined) payload.timezone = data.timezone;
    if (data.primarySkills !== undefined) payload.primarySkills = data.primarySkills;
    if (data.secondarySkills !== undefined) payload.secondarySkills = data.secondarySkills;
    if (data.languages !== undefined) payload.languages = data.languages;
    if (data.education !== undefined) payload.education = data.education;
    if (data.certifications !== undefined) payload.certifications = data.certifications;
    if (data.portfolioUrl !== undefined) payload.portfolioUrl = data.portfolioUrl;
    if (data.websiteUrl !== undefined) payload.websiteUrl = data.websiteUrl;
    if (data.website !== undefined && !data.websiteUrl) payload.websiteUrl = data.website; // Legacy support
    if (data.linkedinUrl !== undefined) payload.linkedinUrl = data.linkedinUrl;
    if (data.linkedin !== undefined && !data.linkedinUrl) payload.linkedinUrl = data.linkedin; // Legacy support
    if (data.githubUrl !== undefined) payload.githubUrl = data.githubUrl;
    if (data.github !== undefined && !data.githubUrl) payload.githubUrl = data.github; // Legacy support
    if (data.videoIntroUrl !== undefined) payload.videoIntroUrl = data.videoIntroUrl;
    if (data.availability !== undefined) payload.availability = data.availability;
    if (data.experienceLevel !== undefined) payload.experienceLevel = data.experienceLevel;
    if (data.experienceYears !== undefined) payload.experienceYears = data.experienceYears;
    
    const response = await api.put<{
      id: number;
      userId: number;
      headline?: string;
      overview?: string;
      hourlyRate?: number;
      hourlyRateMin?: number;
      hourlyRateMax?: number;
      locationCity?: string;
      locationCountry?: string;
      websiteUrl?: string;
      linkedinUrl?: string;
      githubUrl?: string;
      portfolioUrl?: string;
      primarySkills?: string;
      secondarySkills?: string;
      languages?: string;
      education?: string;
      certifications?: string;
      status?: string;
    }>("/profile/freelancer", payload);
    return response.data;
  },
  uploadProfilePicture: async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{
      url: string;
      message: string;
    }>("/profile/freelancer/picture", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
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

// Notifications API
export const notificationsApi = {
  list: async (params?: { read?: boolean; page?: number; size?: number }) => {
    const response = await api.get<{
      content: Array<{
        id: number;
        type: string;
        title: string;
        message: string;
        read: boolean;
        createdAt: string;
        relatedEntityType?: string;
        relatedEntityId?: number;
      }>;
      totalElements: number;
      totalPages: number;
    }>("/notifications", { params });
    return response.data;
  },
  markAsRead: async (id: number) => {
    await api.put(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    await api.put("/notifications/read-all");
  },
};

// Teams API
export const teamsApi = {
  list: async () => {
    const response = await api.get<Array<{
      id: number;
      name: string;
      description?: string;
      leader: { id: number; fullName: string };
      members: Array<{ id: number; fullName: string; email: string }>;
      createdAt: string;
    }>>("/teams");
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get<{
      id: number;
      name: string;
      description?: string;
      leader: { id: number; fullName: string };
      members: Array<{ id: number; fullName: string; email: string }>;
      createdAt: string;
    }>(`/teams/${id}`);
    return response.data;
  },
  create: async (data: { name: string; description?: string }) => {
    const response = await api.post<{
      id: number;
      name: string;
      description?: string;
    }>("/teams", data);
    return response.data;
  },
  update: async (id: number, data: { name?: string; description?: string }) => {
    const response = await api.put(`/teams/${id}`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/teams/${id}`);
  },
  addMember: async (teamId: number, userId: number) => {
    await api.post(`/teams/${teamId}/members`, { userId });
  },
  removeMember: async (teamId: number, userId: number) => {
    await api.delete(`/teams/${teamId}/members/${userId}`);
  },
};

// Sprints API
export const sprintsApi = {
  list: async (projectId: number) => {
    const response = await api.get<Array<{
      id: number;
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status: string;
      projectId: number;
      createdAt: string;
    }>>(`/projects/${projectId}/sprints`);
    return response.data;
  },
  get: async (projectId: number, sprintId: number) => {
    const response = await api.get<{
      id: number;
      name: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      status: string;
      projectId: number;
      tasks: Array<{
        id: number;
        title: string;
        status: string;
      }>;
    }>(`/projects/${projectId}/sprints/${sprintId}`);
    return response.data;
  },
  create: async (projectId: number, data: {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const response = await api.post(`/projects/${projectId}/sprints`, data);
    return response.data;
  },
  update: async (projectId: number, sprintId: number, data: {
    name?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
  }) => {
    const response = await api.put(`/projects/${projectId}/sprints/${sprintId}`, data);
    return response.data;
  },
  delete: async (projectId: number, sprintId: number) => {
    await api.delete(`/projects/${projectId}/sprints/${sprintId}`);
  },
};

// Time Tracking API
export const timeTrackingApi = {
  getActiveTimer: async () => {
    const response = await api.get<{
      id: number;
      projectId: number;
      taskId?: number;
      startTime: string;
      description?: string;
    } | null>("/timer");
    return response.data;
  },
  startTimer: async (data: {
    projectId: number;
    taskId?: number;
    description?: string;
    categoryId?: number;
  }) => {
    const response = await api.post<{
      id: number;
      projectId: number;
      startTime: string;
    }>("/timer/start", data);
    return response.data;
  },
  stopTimer: async () => {
    const response = await api.post<{
      id: number;
      duration: number;
      projectId: number;
    }>("/timer/stop");
    return response.data;
  },
  getTimeLogs: async (projectId: number, params?: { page?: number; size?: number }) => {
    const response = await api.get<Array<{
      id: number;
      taskId?: number;
      startTime: string;
      endTime: string;
      minutes: number;
      description?: string;
      isBillable?: boolean;
      loggedAt: string;
    }> | {
      content: Array<{
        id: number;
        projectId: number;
        taskId?: number;
        startTime: string;
        endTime: string;
        duration: number;
        description?: string;
        category?: { id: number; name: string };
        createdAt: string;
      }>;
      totalElements: number;
    }>(`/projects/${projectId}/time-logs`, { params });
    return response.data;
  },
  getTimeCategories: async () => {
    const response = await api.get<Array<{
      id: number;
      name: string;
      description?: string;
    }>>("/time-categories");
    return response.data;
  },
};

// Files API
export const filesApi = {
  list: async (projectId: number) => {
    const response = await api.get<Array<{
      id: number;
      fileName: string;
      fileUrl: string;
      fileSize: number;
      uploadedBy: { id: number; fullName: string };
      createdAt: string;
    }>>(`/projects/${projectId}/files`);
    return response.data;
  },
  upload: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{
      id: number;
      fileName: string;
      fileUrl: string;
    }>(`/projects/${projectId}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  delete: async (projectId: number, fileId: number) => {
    await api.delete(`/projects/${projectId}/files/${fileId}`);
  },
  processDocument: async (projectId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post<{
      id: number;
      status: string;
      message: string;
    }>(`/projects/${projectId}/documents/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getProcessingStatus: async (projectId: number, processingId: number) => {
    const response = await api.get<{
      id: number;
      status: string;
      fileName?: string;
      ocrText?: string;
    }>(`/projects/${projectId}/documents/${processingId}/status`);
    return response.data;
  },
  getSuggestions: async (projectId: number, processingId: number) => {
    const response = await api.get<Array<{
      id: number;
      title: string;
      description?: string;
      confidenceScore: number;
    }>>(`/projects/${projectId}/documents/${processingId}/suggestions`);
    return response.data;
  },
  createTasksFromSuggestions: async (projectId: number, processingId: number, suggestionIds: number[]) => {
    const response = await api.post<{
      message: string;
      count: number;
      tasks: Array<any>;
    }>(`/projects/${projectId}/documents/${processingId}/create-tasks`, {
      suggestionIds,
    });
    return response.data;
  },
};

// Conversations API (enhanced)
export const conversationsApi = {
  list: async (params?: { projectId?: number }) => {
    const response = await api.get<Array<{
      id: number;
      projectId?: number;
      participants: Array<{ id: number; fullName: string }>;
      lastMessage?: {
        content: string;
        createdAt: string;
        sender: { id: number; fullName: string };
      };
      createdAt: string;
    }>>("/conversations", { params });
    return response.data;
  },
  get: async (id: number) => {
    const response = await api.get<{
      id: number;
      projectId?: number;
      participants: Array<{ id: number; fullName: string }>;
      createdAt: string;
    }>(`/conversations/${id}`);
    return response.data;
  },
  getMessages: async (conversationId: number, page: number = 0, size: number = 50) => {
    const response = await api.get<{
      content: Array<{
        id: number;
        sender: { id: number; fullName: string };
        content: string;
        richContent?: string;
        contentType: string;
        attachments?: Array<{ id: number; fileName: string; fileUrl: string }>;
        createdAt: string;
      }>;
      totalElements: number;
    }>(`/conversations/${conversationId}/messages`, { params: { page, size } });
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
  sendTyping: async (conversationId: number) => {
    await api.post(`/conversations/${conversationId}/typing`);
  },
};

// Tasks API (enhanced)
export const tasksApiEnhanced = {
  create: async (projectId: number, data: {
    title: string;
    description?: string;
    status?: string;
    dueDate?: string;
    milestoneId?: number;
    assigneeId?: number;
    labelIds?: number[];
  }) => {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },
  update: async (projectId: number, taskId: number, data: {
    title?: string;
    description?: string;
    status?: string;
    dueDate?: string;
    assigneeId?: number;
    labelIds?: number[];
  }) => {
    const response = await api.put(`/projects/${projectId}/tasks/${taskId}`, data);
    return response.data;
  },
  delete: async (projectId: number, taskId: number) => {
    await api.delete(`/projects/${projectId}/tasks/${taskId}`);
  },
  getComments: async (taskId: number) => {
    const response = await api.get<Array<{
      id: number;
      author: { id: number; fullName: string };
      content: string;
      attachments?: Array<{ id: number; fileName: string; fileUrl: string }>;
      createdAt: string;
    }>>(`/tasks/${taskId}/comments`);
    return response.data;
  },
  addComment: async (taskId: number, data: {
    content: string;
    attachmentIds?: number[];
  }) => {
    const response = await api.post(`/tasks/${taskId}/comments`, data);
    return response.data;
  },
  getAttachments: async (taskId: number) => {
    const response = await api.get<Array<{
      id: number;
      fileName: string;
      fileUrl: string;
      uploadedBy: { id: number; fullName: string };
      createdAt: string;
    }>>(`/tasks/${taskId}/attachments`);
    return response.data;
  },
  addAttachment: async (taskId: number, file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
  getLabels: async () => {
    const response = await api.get<Array<{
      id: number;
      name: string;
      color?: string;
    }>>("/task-labels");
    return response.data;
  },
};

// Export the axios instance for custom requests
export default api;

