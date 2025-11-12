import api from "./api";

export const getDashboardData = async () => {
  try {
    const response = await api.get("/dashboard-data");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export const getCalendarData = async (startDate, endDate) => {
  try {
    const response = await api.get(`/calender-data/all`, {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    throw error;
  }
};
