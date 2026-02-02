import companyApi from "../api/companyApi";
import handleApi from "../utils/handleApi";

const companyService = {
    getVerificationRequests: (filters) =>
        handleApi(() => companyApi.getVerificationRequests(filters)),

    getAllCompanies: (filters) =>
        handleApi(() => companyApi.getAllCompanies(filters)),

    createCompanyVerificationRequest: (data, documents) =>
        handleApi(() => companyApi.createCompanyVerificationRequest(data, documents)),

    getCompanyDetail: (companyId) =>
        handleApi(() => companyApi.getCompanyDetail(companyId)),

    getCompanyVerificationRequestDetail: (requestId) =>
        handleApi(() => companyApi.getCompanyVerificationRequestDetail(requestId)),

    getVerificationRequestByCompanyId: (companyId) =>
        handleApi(() => companyApi.getVerificationRequestByCompanyId(companyId)),

    changeCompanyStatus: (companyId, isActive) =>
        handleApi(() => companyApi.changeCompanyStatus(companyId, isActive)),

    updateCompany: (companyId, data, file) =>
        handleApi(() => companyApi.updateCompany(companyId, data, file)),

    deleteCompany: (companyId) =>
        handleApi(() => companyApi.deleteCompany(companyId)),

    reviewCompanyVerificationRequest: (payload) =>
        handleApi(() => companyApi.reviewCompanyVerificationRequest(payload)),

    createInvitation: (payload) =>
        handleApi(() => companyApi.createInvitation(payload))
};

export default companyService;
