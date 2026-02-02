import axiosClient from "./axiosClient";

const jobApi = {
  
  getBaseJobs(params) {
    return axiosClient.get("/jobs/base", { params });
  },
  getAllJobs(params) {
    return axiosClient.get("/jobs", { params });
  },

  getJobDetail(id) {
    return axiosClient.get(`/jobs/${id}`);
  },

  getJobsByHr(hrId, params) {
    return axiosClient.get(`/jobs/hr/${hrId}`, { params });
  },

  getJobsByCompany(companyId, params) {
    return axiosClient.get(`/jobs/company/${companyId}`, { params });
  },
  createJob(data) {
    return axiosClient.post("/jobs", data);
  },
  updateJob(id, data) {
    return axiosClient.put(`/jobs/${id}`, data);
  },

  updateJobStatus(id, status) {
    return axiosClient.put(`/jobs/${id}/status`, null, {
      params: { status },
    });
  },
};

export default jobApi;
