import authApi from "../api/authApi";
import { ROLE_ID } from "../constants/roles";
const authService = {
  async register(data) {
    try {
      const res = await authApi.register(data);
      const authResponse = res.data?.data;
      
      if (authResponse && !authResponse.user) {
        return { user: authResponse };
      }
      
      return authResponse;
    } catch (error) {
      console.error("Lỗi đăng ký:", error);
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

    if (!u.isEmailVerified) {
      localStorage.setItem("pending_verify_email", u.email);
      localStorage.setItem("verify_skip_cooldown", "0");

      return {
        path: "/verify",
        state: {
          email: u.email,
          skipCooldown: false,
        },
      };
    }

    if (!u.phoneNumber) {
      return { path: "/additional-information" };
    }

    if (u.roleId === ROLE_ID.ADMIN) {
      return { path: "/admin/dashboard" };
    }

    if (u.roleId === ROLE_ID.COMPANY_ADMIN) {
      return { path: "/company-admin/dashboard" };
    }

    if (u.roleId === ROLE_ID.HR) {
      return { path: "/hr/dashboard" };
    }

    return { path: "/" };
  },

  async logout() {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Lỗi logout:", error);
    } finally {
      localStorage.removeItem("pending_verify_email");
      localStorage.removeItem("verify_skip_cooldown");
      localStorage.removeItem("token");
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
