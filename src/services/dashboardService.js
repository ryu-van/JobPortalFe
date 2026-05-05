import handleApi from "../utils/handleApi";
import dashboardApi from "../api/dashboardApi";

const dashboardService = {
  getStats: () => handleApi(() => dashboardApi.getStats()),
};

export default dashboardService;
