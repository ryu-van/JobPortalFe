import axiosClient from "./axiosClient";
const userApi = {
  updateUser: (id, data) => axiosClient.put(`/users/${id}`, data),
  updateAvatar: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.put(`/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  toggleStatus: (id, status) => {
    return axiosClient.put(`/users/status/${id}`, null, {
      params: { status },
    });
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
  getUserDetail: (id) => {
    return axiosClient.get(`/users/detail/${id}`);
  },
  getHRs: ({
    keyword,
    companyName,
    isActive,
    pageNo = 0,
    size = 16,
    asc = "asc",
  }) => {
    return axiosClient.get(`/users/hrs`, {
      params: { keyword, companyName, isActive, pageNo, size, asc },
    });
  },
  getCandidates: ({
    keyword,
    isActive,
    pageNo = 0,
    size = 16,
    asc = "asc",
  }) => {
    return axiosClient.get(`/users/candidates`, {
      params: { keyword, isActive, pageNo, size, asc },
    });
  },
  getUsersByAdminCompany: ({
    keyword,
    isActive,
    pageNo = 0,
    size = 16,
    asc = "asc",
  }) => {
    return axiosClient.get(`/users/admin-company/users`, {
      params: { keyword, isActive, pageNo, size, asc },
    });
  },
  getUsersInCompany: ({ companyId, keyword, isActive, asc = "asc" }) => {
    return axiosClient.get(`/users/${companyId}/users`, {
      params: { keyword, isActive, asc },
    });
  },
};
export default userApi;
