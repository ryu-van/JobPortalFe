import handleApi from "../utils/handleApi";
import hrApi from "../api/hrApi";

const hrService = {
 
  getCandidates: (companyId) => handleApi(() => hrApi.getCandidates(companyId)),

  
  getApplications: (companyId) =>
    handleApi(() => hrApi.getApplications(companyId)),

 
  updateApplicationStatus: (applicationId, status) =>
    handleApi(() => hrApi.updateApplicationStatus(applicationId, status)),
};

export default hrService;
