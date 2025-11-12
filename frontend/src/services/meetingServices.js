import api from "./api";

const meetingServices = {
  // Create a new meeting
  createMeeting: async (meetingData) => {
    try {
      console.log("meetingData in Services", meetingData);
      const response = await api.post("/meeting/create", meetingData);
      return response.data;
    } catch (error) {
      console.error("Error creating meeting:", error);
      throw error.response?.data || { message: "Failed to create meeting" };
    }
  },

  // Update meeting details
  updateMeeting: async (meetingId, meetingData) => {
    try {
      const response = await api.put(
        `/meeting/update/${meetingId}`,
        meetingData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating meeting:", error);
      throw error.response?.data || { message: "Failed to update meeting" };
    }
  },

  // Change meeting status
  changeMeetingStatus: async (meetingId, statusData) => {
    try {
      const response = await api.patch(
        `/meeting/status/${meetingId}`,
        statusData
      );
      return response.data;
    } catch (error) {
      console.error("Error changing meeting status:", error);
      throw (
        error.response?.data || { message: "Failed to change meeting status" }
      );
    }
  },

  // Get meetings with filters
  getMeetings: async (filters) => {
    try {
      const response = await api.get("/meeting/list", { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching meetings:", error);
      throw error.response?.data || { message: "Failed to fetch meetings" };
    }
  },

  // Send meeting reminder
  sendMeetingReminder: async (meetingId) => {
    try {
      const response = await api.get(`/meeting/send-reminder/${meetingId}`);
      return response.data;
    } catch (error) {
      console.error("Error sending meeting reminder:", error);
      throw error.response?.data || { message: "Failed to send reminder" };
    }
  },
};

export default meetingServices;
