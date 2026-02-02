import handleApi from "../utils/handleApi";
import jobApi from "../api/jobApi";
const jobService = {
    getBaseJobs: (params) => handleApi(() => jobApi.getBaseJobs(params)),
    getAllJobs: (params) => handleApi(() => jobApi.getAllJobs(params)),
    getJobDetail: (id) => handleApi(() => jobApi.getJobDetail(id)),
    getJobsByHr: (hrId, params) => handleApi(() => jobApi.getJobsByHr(hrId, params)),
    getJobsByCompany: (companyId, params) => handleApi(() => jobApi.getJobsByCompany(companyId, params)),
    createJob: (data) => handleApi(() => jobApi.createJob(data)),
    updateJob: (id, data) => handleApi(() => jobApi.updateJob(id, data)),
    updateJobStatus: (id, status) => handleApi(() => jobApi.updateJobStatus(id, status)),
};

export default jobService;