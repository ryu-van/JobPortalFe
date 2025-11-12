import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, 
});



axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized - có thể hết hạn phiên đăng nhập");
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
