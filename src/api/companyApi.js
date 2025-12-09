// src/api/companyApi.js
import axiosClient from "./axiosClient";

const companyApi = {
    getVerificationRequests: ({ keyword, verifyStatus, createdDate, page = 0, size = 16 }) => {
        return axiosClient.get("/companies/requests", {
            params: { keyword, verifyStatus, createdDate, page, size }
        });
    },

    getAllCompanies: ({ keyword, location, isActive, page = 0, size = 16 }) => {
        return axiosClient.get("/companies", {
            params: { keyword, location, isActive, page, size }
        });
    },
    createCompanyVerificationRequest: (data) => {
        return axiosClient.post("/companies/requests", data);
    },
    getCompanyDetail: (companyId) => {
        return axiosClient.get(`/companies/${companyId}`);
    },
    getCompanyVerificationRequestDetail: (requestId) => {
        return axiosClient.get(`/companies/requests/detail/${requestId}`);
    },

    getVerificationRequestByCompanyId: (companyId) => {
        return axiosClient.get(`/companies/requests/company/${companyId}`);
    },
    changeCompanyStatus: (companyId, isActive) => {
        return axiosClient.put(`/companies/${companyId}/status`, null, {
            params: { isActive }
        });
    },
    updateCompany: (companyId, data, file) => {
        const formData = new FormData();
        formData.append("file", file);

        // append JSON fields
        Object.keys(data).forEach((key) => {
            formData.append(key, data[key]);
        });

        return axiosClient.put(`/companies/${companyId}`, formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
    },
    deleteCompany: (companyId) => {
        return axiosClient.delete(`/companies/${companyId}`);
    },
    reviewCompanyVerificationRequest: ({ requestId, reviewedById, isApproved, reason }) => {
        return axiosClient.put(`/companies/requests/${requestId}/review`, null, {
            params: { reviewedById, isApproved, reason }
        });
    },
    createInvitation: ({ companyId, createdById, email, maxUses, expiresInHours }) => {
        return axiosClient.post("/companies/invitations", null, {
            params: { companyId, createdById, email, maxUses, expiresInHours }
        });
    }
};

export default companyApi;
