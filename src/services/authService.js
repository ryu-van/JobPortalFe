import authApi from "../api/authApi";

const authService = {
  async login(email, password) {
    const res = await authApi.login({ email, password });
    const user = res.data?.data; 
    return user;
  },

  async logout() {
    await authApi.logout();
  },

  async getCurrentUser() {
    const res = await authApi.getCurrentUser();
    return res.data?.data;
  },
};

export default authService;
