import axiosClient from "./axiosClient";

const authApi = {
  // Đăng ký tài khoản
  register: (data) => axiosClient.post("/auth/register", data),

  // Đăng nhập (BE sẽ trả cookie access_token + refresh_token)
  login: (data) => axiosClient.post("/auth/login", data),
  // Làm mới token (cookie refresh_token tự gửi lên)
  refresh: () => axiosClient.post("/auth/refresh"),
  // Lấy thông tin người dùng hiện tại (BE đọc từ cookie access_token)
  getCurrentUser: () => axiosClient.get("/auth/me"),
  // Đăng xuất (xoá cookie ở backend)
  logout: () => axiosClient.post("/auth/logout"),
  // Xác minh email (gửi link trong email BE gửi)
  verifyEmail: (token) =>
    axiosClient.get(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  // Gửi lại mail xác minh
  resendVerification: (email) =>
    axiosClient.post("/auth/resend-verification", { email }),
};

export default authApi;
