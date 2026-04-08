import axiosClient from "./axiosClient";

const userApi = {
  createUser: (payload, avatarFile) => {
    const formData = new FormData();

    formData.append(
      "createUserRequest",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    return axiosClient.post(`/users`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  updateUser: (id, data) => {
    return axiosClient.put(`/users/${id}`, data);
  },

  updateAvatar: (id, file) => {
    const formData = new FormData();
    formData.append("file", file);

    return axiosClient.put(`/users/${id}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  toggleStatus: (id, status) => {
    return axiosClient.patch(`/users/${id}/status`, null, {
      params: { status },
    });
  },
  deleteUser: (id) => {
    return axiosClient.delete(`/users/${id}`);
  },
  getUserDetail: (id) => {
    return axiosClient.get(`/users/${id}`);
  },
  getUsersByRole: ({
    role,
    keyword,
    companyName,
    isActive,
    pageNo = 0,
    size = 16,
    asc = "asc",
  }) => {
    return axiosClient.get(`/users`, {
      params: {
        role,
        keyword,
        companyName,
        isActive,
        pageNo,
        size,
        asc,
      },
    });
  },
  getUsersInCompany: ({ companyId, keyword, isActive, asc = "asc" }) => {
    return axiosClient.get(`/users/${companyId}/users`, {
      params: { keyword, isActive, asc },
    });
  },
};

export default userApi;
