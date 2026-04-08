import axiosClient from "./axiosClient";

const jobApi = {
  
  getBaseJobs(params) {
    return axiosClient.get("/jobs/base", { params });
  },
  getAllJobs(params) {
    return axiosClient.get("/jobs", { params });
  },
  getJobs(params) {
    return axiosClient.get("/jobs/filter", { params });
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
  patchJobStatus(id, status) {
    return axiosClient.patch(`/jobs/${id}/status`, null, {
      params: { status },
    });
  },

  // Saved jobs
  addJobToSavedJobs(jobId, userId) {
    return axiosClient.post(`/jobs/${jobId}/saved-jobs`, null, {
      params: { userId },
    });
  },
  removeJobFromSavedJobs(savedJobId) {
    return axiosClient.delete(`/jobs/saved-jobs/${savedJobId}`);
  },
  getSavedJobs(userId) {
    return axiosClient.get(`/jobs/saved-jobs`, { params: { userId } });
  },

  // Skills
  getSkills() {
    return axiosClient.get("/jobs/skills");
  },
  createSkill(data) {
    return axiosClient.post("/jobs/skills", data);
  },
  updateSkill(id, data) {
    return axiosClient.put(`/jobs/skills/${id}`, data);
  },
  deleteSkill(id) {
    return axiosClient.delete(`/jobs/skills/${id}`);
  },
};

export default jobApi;
