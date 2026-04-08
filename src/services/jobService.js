import handleApi from "../utils/handleApi";
import jobApi from "../api/jobApi";
const jobService = {
    getBaseJobs: (params) => handleApi(() => jobApi.getBaseJobs(params)),
    getAllJobs: (params) => handleApi(() => jobApi.getAllJobs(params)),
    getJobs: (params) => handleApi(() => jobApi.getJobs(params)),
    getJobDetail: (id) => handleApi(() => jobApi.getJobDetail(id)),
    getJobsByHr: (hrId, params) => handleApi(() => jobApi.getJobsByHr(hrId, params)),
    getJobsByCompany: (companyId, params) => handleApi(() => jobApi.getJobsByCompany(companyId, params)),
    createJob: (data) => handleApi(() => jobApi.createJob(data)),
    updateJob: (id, data) => handleApi(() => jobApi.updateJob(id, data)),
    updateJobStatus: (id, status) => handleApi(() => jobApi.updateJobStatus(id, status)),
    patchJobStatus: (id, status) => handleApi(() => jobApi.patchJobStatus(id, status)),
    addJobToSavedJobs: (jobId, userId) => handleApi(() => jobApi.addJobToSavedJobs(jobId, userId)),
    removeJobFromSavedJobs: (savedJobId) => handleApi(() => jobApi.removeJobFromSavedJobs(savedJobId)),
    getSavedJobs: (userId) => handleApi(() => jobApi.getSavedJobs(userId)),
    getSkills: () => handleApi(() => jobApi.getSkills()),
    createSkill: (data) => handleApi(() => jobApi.createSkill(data)),
    updateSkill: (id, data) => handleApi(() => jobApi.updateSkill(id, data)),
    deleteSkill: (id) => handleApi(() => jobApi.deleteSkill(id)),
};

export default jobService;
