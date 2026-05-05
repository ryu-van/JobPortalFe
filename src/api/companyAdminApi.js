import axiosClient from "./axiosClient";

const companyAdminApi = {

  getHrUsers(companyId) {
    return axiosClient.get(`/companies/${companyId}/hr-users`);
  },

  
  updateHrUserStatus(companyId, userId, isActive) {
    return axiosClient.patch(
      `/companies/${companyId}/hr-users/${userId}/status`,
      { isActive }
    );
  },

  getInvitations(companyId) {
    return axiosClient.get(`/companies/${companyId}/invitations`);
  },

  createInvitation(companyId, payload) {
    return axiosClient.post(`/companies/${companyId}/invitations`, payload);
  },
};

export default companyAdminApi;
