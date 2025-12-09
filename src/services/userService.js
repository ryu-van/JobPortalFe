import userApi from "../api/userApi";

const handleApi = async (apiCall) => {
  try {
    const res = await apiCall();
    return res.data?.data;
  } catch (error) {
    return Promise.reject(error);
  }
};

const userService = {
  updateUser(id, data) {
    if (!id) {
      return Promise.reject(new Error("Invalid user id"));
    }
    return handleApi(() => userApi.updateUser(id, data));
  },

  async updateAvatar(id, file) {
    if (!id) {
      return Promise.reject(new Error("Invalid user id"));
    }
    try {
      const res = await userApi.updateAvatar(id, file);
      const data = res.data?.data;
      return typeof data === "string" ? data : (data?.url || data);
    } catch (error) {
      return Promise.reject(error);
    }
  },

  toggleStatus(id, status) {
    return handleApi(() => userApi.toggleStatus(id, status));
  },

  deleteUser(id) {
    return handleApi(() => userApi.deleteUser(id));
  },

  getUserDetail(id) {
    return handleApi(() => userApi.getUserDetail(id));
  },

  getHRs(params = {}) {
    return handleApi(() => userApi.getHRs(params));
  },

  getCandidates(params = {}) {
    return handleApi(() => userApi.getCandidates(params));
  },

  getUsersByAdminCompany(params = {}) {
    return handleApi(() => userApi.getUsersByAdminCompany(params));
  },

  getUsersInCompany(params = {}) {
    return handleApi(() => userApi.getUsersInCompany(params));
  }
};

export default userService;

