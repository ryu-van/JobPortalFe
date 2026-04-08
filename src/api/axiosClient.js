import axios from "axios";
import { getUserFriendlyError } from "../utils/errorHandler";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true, 
});

const plainAxios = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1",
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error) => {
  refreshQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve();
    }
  });
  refreshQueue = [];
};


axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const status = error.response?.status;
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          await plainAxios.post("/auth/refresh");
          isRefreshing = false;
          processQueue(null);
        } catch (e) {
          isRefreshing = false;
          processQueue(e);
          return Promise.reject(e);
        }
      }
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: async () => {
            try {
              const retryRes = await axiosClient(originalRequest);
              resolve(retryRes);
            } catch (e) {
              reject(e);
            }
          },
          reject: (e) => reject(e),
        });
      });
    }
    const apiMessage = error.response?.data?.message;
    const friendly = getUserFriendlyError(apiMessage);
    return Promise.reject(
      {
        ...error,
        friendlyMessage: friendly
      }
    );
  }
);

export default axiosClient;
