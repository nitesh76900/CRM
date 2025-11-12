import api from "./api";

class LeadStatusLabelService {
  static async addLeadStatusLabel(data) {
    try {
      console.log("data", data);
      const response = await api.post("/company/lead-status", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error(
        "Failed to add lead status label. Please try again later."
      );
    }
  }

  static async updateLeadStatusLabel(leadStatusLabelId, data) {
    try {
      const response = await api.put(
        `/company/lead-status/${leadStatusLabelId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(
          error.response.data.message || "Lead status label not found"
        );
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error(
        "Failed to update lead status label. Please try again later."
      );
    }
  }

  static async getAllLeadStatusLabels() {
    try {
      const response = await api.get("/company/lead-status");
      return response.data;
    } catch (error) {
      throw new Error(
        "Failed to fetch lead status labels. Please try again later."
      );
    }
  }
}

export default LeadStatusLabelService;
