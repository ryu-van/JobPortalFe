import userApi from "../api/userApi";
import handleApi from "../utils/handleApi";

const userService = {
  createUser(data, avatarFile) {
    return handleApi(() => userApi.createUser(data, avatarFile));
  },

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
      return typeof data === "string" ? data : data?.url || data;
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

  getUsers(params = {}) {
    return handleApi(() => userApi.getUsersByRole(params));
  },

  getUsersInCompany(params = {}) {
    return handleApi(() => userApi.getUsersInCompany(params));
  },
};

export default userService;
