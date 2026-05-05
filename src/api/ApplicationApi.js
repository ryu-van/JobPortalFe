import axiosClient from "./axiosClient";

const ApplicationApi = {
    applyJob(jobId, data) {
        return axiosClient.post(`/applications`, data);
    },

    changeApplicationStatus(applicationId, status, notes) {
        return axiosClient.put(`/applications/${applicationId}/status`, null, {
            params: { newStatus: status, notes },
        });
    },

    getApplications() {
        return axiosClient.get("/applications/me");
    },

    getApplicationsByJob(jobId) {
        return axiosClient.get(`/applications/job/${jobId}`);
    },

    getApplicationDetail(applicationId) {
        return axiosClient.get(`/applications/${applicationId}/history`);
    }
};

export default ApplicationApi;