import api from "./api";

const HolidayService = {
  addHoliday: async (holidayData) => {
    try {
      const response = await api.post("/attendance/holiday", holidayData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  updateHoliday: async (id, updatedData) => {
    try {
      const response = await api.put(`/attendance/holiday/${id}`, updatedData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  getHolidaysByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get("/attendance/holiday", {
        params: { startDate, endDate }, 
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  deleteHoliday: async (id) => {
    try {
      const response = await api.delete(`/attendance/holiday/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default HolidayService;
