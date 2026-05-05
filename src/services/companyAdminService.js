import handleApi from "../utils/handleApi";
import companyAdminApi from "../api/companyAdminApi";

const companyAdminService = {

  getHrUsers: (companyId) =>
    handleApi(() => companyAdminApi.getHrUsers(companyId)),


  updateHrUserStatus: (companyId, userId, isActive) =>
    handleApi(() => companyAdminApi.updateHrUserStatus(companyId, userId, isActive)),

 
  getInvitations: (companyId) =>
    handleApi(() => companyAdminApi.getInvitations(companyId)),

  createInvitation: (companyId, payload) =>
    handleApi(() => companyAdminApi.createInvitation(companyId, payload)),
};

export default companyAdminService;
