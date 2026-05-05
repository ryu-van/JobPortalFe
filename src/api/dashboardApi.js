import axiosClient from "./axiosClient";

const dashboardApi = {
  getStats() {
    return axiosClient.get("/dashboard/stats");
  },
};

export default dashboardApi;
