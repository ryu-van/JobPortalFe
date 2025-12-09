import axios from "axios";
import { getUserFriendlyError } from "../utils/errorHandler";

const axiosClient = axios.create({
  baseURL: "http://localhost:8080/api/v1",
  withCredentials: true, 
});



axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
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
