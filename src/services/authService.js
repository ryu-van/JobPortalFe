import authApi from "../api/authApi";

const authService = {
  async register(data) {
    try {
      const res = await authApi.register(data);
      const authResponse = res.data?.data;
      return authResponse;
    } catch (error) {
      console.error("❌ Lỗi đăng ký:", error);
      throw error;
    }
  },
  async login(email, password) {
    const res = await authApi.login({ email, password });
    const data = res.data?.data;

    return {
      accessToken: data.accessToken,
      tokenType: data.tokenType,
      user: data.user,
    };
  },

  determinePostLoginRoute(data) {
    const u = data.user;

    if (!u.emailVerified) {
      return {
        path: "/verify",
        state: {
          email: u.email,
          skipCooldown: false,
        },
        localStorage: {
          pending_verify_email: u.email,
          verify_skip_cooldown: "0",
        },
      };
    }

    if (!u.phoneNumber) {
      return { path: "/additional-information" };
    }

    return { path: "/" };
  },

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("❌ Lỗi logout:", error);
    } finally {
      localStorage.removeItem("pending_verify_email");
      localStorage.removeItem("verify_skip_cooldown");
    }
  },

  async getCurrentUser() {
    const res = await authApi.getCurrentUser();
    return res.data?.data?.user;
  },
  async verifyEmail(token) {
    const res = await authApi.verifyEmail(token);
    return res.data?.data;
  },
  async resendVerification(email) {
    const res = await authApi.resendVerification(email);
    return res.data?.data;
  },
};

export default authService;
