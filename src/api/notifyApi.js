import axiosClient from "./axiosClient";

const notifyApi = {
  getAll() {
    return axiosClient.get("/notifications/");
  },

  markRead(id) {
    return axiosClient.put(`/notifications/${id}/read`);
  },

  markAllRead() {
    return axiosClient.put("/notifications/read-all");
  },
};

export default notifyApi;
