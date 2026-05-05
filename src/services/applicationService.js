import handleApi from "@/utils/handleApi";
import applicationApi from "@/api/ApplicationApi";

const applicationService = {
  async applyJob(jobId, data) {
    return handleApi(() => applicationApi.applyJob(jobId, data));
  },

  async changeApplicationStatus(applicationId, status) {
    return handleApi(() => applicationApi.changeApplicationStatus(applicationId, status));
  },

  async getApplications() {
    return handleApi(() => applicationApi.getApplications());
  },

  async getApplicationsByJob(jobId) {
    return handleApi(() => applicationApi.getApplicationsByJob(jobId));
  },

  async getApplicationDetail(applicationId) {
    return handleApi(() => applicationApi.getApplicationDetail(applicationId));
  },
};

export default applicationService;