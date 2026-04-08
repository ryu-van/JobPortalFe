import axiosClient from "./axiosClient";

const companyApi = {
  // ─── Company ────────────────────────────────────────────────────────────────

  getAllCompanies: ({ keyword, location, isActive, page = 0, size = 16 }) => {
    return axiosClient.get("/companies", {
      params: { keyword, location, isActive, page, size },
    });
  },

  getCompanyDropdown: (keyword) => {
    return axiosClient.get("/companies/dropdown", {
      params: { keyword },
    });
  },

  getCompanyDetail: (companyId) => {
    return axiosClient.get(`/companies/${companyId}`);
  },

  updateCompany: (companyId, data, file) => {
    const formData = new FormData();

    formData.append(
      "companyRequest",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (file) {
      formData.append("file", file);
    }

    return axiosClient.put(`/companies/${companyId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteCompany: (companyId) => {
    return axiosClient.delete(`/companies/${companyId}`);
  },

  changeCompanyStatus: (companyId, isActive) => {
    return axiosClient.patch(`/companies/${companyId}/status`, null, {
      params: { isActive },
    });
  },

  // ─── Invitations ────────────────────────────────────────────────────────────

  createInvitation: (companyId, { createdById, email, maxUses, expiresInHours }) => {
    return axiosClient.post(`/companies/${companyId}/invitations`, {
      createdById,
      email,
      maxUses,
      expiresInHours,
    });
  },

  // ─── Verification Requests ───────────────────────────────────────────────────

  getVerificationRequests: ({
    keyword,
    verifyStatus,
    createdDate,
    page = 0,
    size = 16,
  }) => {
    return axiosClient.get("/companies/requests", {
      params: { keyword, verifyStatus, createdDate, page, size },
    });
  },

  createCompanyVerificationRequest: (data, logo, documents) => {
    const formData = new FormData();
    formData.append(
      "companyRequest",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (logo) {
      formData.append("file", logo);
    }

    documents?.forEach((item) => {
      formData.append("documents", item.file || item);
    });

    return axiosClient.post("/companies/requests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateCompanyVerificationRequest: (requestId, data, logo, documents) => {
    const formData = new FormData();
    formData.append(
      "companyRequest",
      new Blob([JSON.stringify(data)], { type: "application/json" })
    );

    if (logo) {
      formData.append("file", logo);
    }

    documents?.forEach((item) => {
      formData.append("documents", item.file || item);
    });

    return axiosClient.put(`/companies/requests/${requestId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  getVerificationRequestDetail: (requestId) => {
    return axiosClient.get(`/companies/requests/${requestId}`);
  },

  getVerificationRequestByCompanyId: (companyId) => {
    return axiosClient.get(`/companies/${companyId}/requests`);
  },

  reviewCompanyVerificationRequest: (requestId, { reviewedById, isApproved, reason }) => {
    return axiosClient.put(`/companies/requests/${requestId}/review`, {
      reviewedById,
      isApproved,
      reason,
    });
  },
  // ─── Industry ───────────────────────────────────────────────────
  getAllIndustries: (name) => {
    return axiosClient.get("/companies/industries", {
      params: { name },
    });
  },
 
  getIndustryDetail: (id) => {
    return axiosClient.get(`/companies/industries/${id}`);
  },
 
  createIndustry: (data) => {
    return axiosClient.post("/companies/industries", data);
  },
 
  updateIndustry: (id, data) => {
    return axiosClient.put(`/companies/industries/${id}`, data);
  },
 
  changeIndustryStatus: (id, isActive) => {
    return axiosClient.patch(`/companies/industries/${id}/status`, null, {
      params: { isActive },
    });
  },
 
  deleteIndustry: (id) => {
    return axiosClient.delete(`/companies/industries/${id}`);
  },

};

export default companyApi;
