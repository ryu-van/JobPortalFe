import axiosClient from "./axiosClient";

const authApi = {
  register: (data) => axiosClient.post("/auth/register", data),
  login: (data) => axiosClient.post("/auth/login", data),
  refresh: () => axiosClient.post("/auth/refresh"),
  getCurrentUser: () => axiosClient.get("/auth/me"),
  logout: () => axiosClient.post("/auth/logout"),
  verifyEmail: (token) =>
    axiosClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (email) =>
    axiosClient.post("/auth/resend-verification", { email }),
};

export default authApi;
