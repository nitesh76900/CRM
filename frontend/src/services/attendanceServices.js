import api from "./api";

const attendanceService = {
  
  setAttendanceBy: async (attendanceBy) => {
    try {
      const response = await api.post("/company/attendance-setting/attendance-by", { attendanceBy });
      return response.data;
    } catch (error) {
      console.error("Error setting attendanceBy:", error.response?.data || error.message);
      throw error || { message: "Failed to update attendance settings." };
    }
  },


  getAttendanceBy: async () => {
    try {
      const response = await api.get("/company/attendance-setting/attendance-by");
      return response.data;
    } catch (error) {
      console.error("Error fetching attendanceBy:", error.response?.data || error.message);
      throw error || { message: "Failed to fetch attendance settings." };
    }
  },

 
  setAttendanceCheckBy: async (settings) => {
    try {
      const response = await api.post("/company/attendance-setting/attendance-check-by", settings);
      return response.data;
    } catch (error) {
      console.error("Error setting attendanceCheckBy:", error.response?.data || error.message);
      throw error || { message: "Failed to update attendance check settings." };
    }
  },

  
  getAttendanceCheckBy: async () => {
    try {
      const response = await api.get("/company/attendance-setting/attendance-check-by");
      return response.data;
    } catch (error) {
      console.error("Error fetching attendanceCheckBy:", error.response?.data || error.message);
      throw error || { message: "Failed to fetch attendance check settings." };
    }
  },

  deleteAttendanceCheckBy: async (settings) => {
    try {
      const response = await api.delete("/company/attendance-setting/attendance-check-by", { data: settings });
      return response.data;
    } catch (error) {
      console.error("Error deleting attendanceCheckBy:", error.response?.data || error.message);
      throw error || { message: "Failed to delete attendance check settings." };
    }
  },
};

export default attendanceService;
