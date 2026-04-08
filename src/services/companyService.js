import companyApi from "../api/companyApi";
import handleApi from "../utils/handleApi";

const companyService = {
  // ─── Company ────────────────────────────────────────────────────────────────

  getAllCompanies: (filters) =>
    handleApi(() => companyApi.getAllCompanies(filters)),

  getCompanyDropdown: (keyword) =>
    handleApi(() => companyApi.getCompanyDropdown(keyword)),

  getCompanyDetail: (companyId) =>
    handleApi(() => companyApi.getCompanyDetail(companyId)),

  updateCompany: (companyId, data, file) =>
    handleApi(() => companyApi.updateCompany(companyId, data, file)),

  deleteCompany: (companyId) =>
    handleApi(() => companyApi.deleteCompany(companyId)),

  changeCompanyStatus: (companyId, isActive) =>
    handleApi(() => companyApi.changeCompanyStatus(companyId, isActive)),

  // ─── Invitations ────────────────────────────────────────────────────────────

  createInvitation: (companyId, payload) =>
    handleApi(() => companyApi.createInvitation(companyId, payload)),

  // ─── Verification Requests ───────────────────────────────────────────────────

  getVerificationRequests: (filters) =>
    handleApi(() => companyApi.getVerificationRequests(filters)),

  createCompanyVerificationRequest: (data, logo, documents) =>
    handleApi(() =>
      companyApi.createCompanyVerificationRequest(data, logo, documents),
    ),

  updateCompanyVerificationRequest: (requestId, data, logo, documents) =>
    handleApi(() =>
      companyApi.updateCompanyVerificationRequest(
        requestId,
        data,
        logo,
        documents,
      ),
    ),

  getVerificationRequestDetail: (requestId) =>
    handleApi(() => companyApi.getVerificationRequestDetail(requestId)),

  getVerificationRequestByCompanyId: (companyId) =>
    handleApi(() => companyApi.getVerificationRequestByCompanyId(companyId)),

  reviewCompanyVerificationRequest: (requestId, payload) =>
    handleApi(() =>
      companyApi.reviewCompanyVerificationRequest(requestId, payload),
    ),
  // ─── Industry ───────────────────────────────────────────────────
  getAllIndustries: (name) =>
    handleApi(() => companyApi.getAllIndustries(name)),

  getIndustryDetail: (id) => handleApi(() => companyApi.getIndustryDetail(id)),

  createIndustry: (data) => handleApi(() => companyApi.createIndustry(data)),

  updateIndustry: (id, data) =>
    handleApi(() => companyApi.updateIndustry(id, data)),

  changeIndustryStatus: (id, isActive) =>
    handleApi(() => companyApi.changeIndustryStatus(id, isActive)),

  deleteIndustry: (id) => handleApi(() => companyApi.deleteIndustry(id)),
};

export default companyService;
