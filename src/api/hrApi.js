import axiosClient from "./axiosClient";

const hrApi = {

  getApplications(companyId) {
    return axiosClient.get("/applications", { params: { companyId } });
  },

  getCandidates(companyId) {
    return axiosClient.get("/applications", { params: { companyId } });
  },

 
  updateApplicationStatus(applicationId, status) {
    return axiosClient.put(`/applications/${applicationId}/status`, null, {
      params: { newStatus: status },
    });
  },
};

export default hrApi;
