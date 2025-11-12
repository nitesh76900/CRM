import api from "./api";

class LeadForServices {
  static async addLeadFor(data) {
    try {
      const response = await api.post("/company/lead-for", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error("Failed to add lead for. Please try again later.");
    }
  }

  static async updateLeadFor(leadForId, data) {
    try {
      const response = await api.put(`/company/lead-for/${leadForId}`, data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(error.response.data.message || "Lead for not found");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error("Failed to update lead for. Please try again later.");
    }
  }

  static async toggleActiveLeadFor(leadForId) {
    try {
      const response = await api.patch(`/company/lead-for/${leadForId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(error.response.data.message || "Lead for not found");
      }
      throw new Error(
        "Failed to toggle lead for status. Please try again later."
      );
    }
  }

  static async getActiveLeadFors() {
    try {
      const response = await api.get("/company/lead-for");
      return response.data;
    } catch (error) {
      throw new Error(
        "Failed to fetch active lead fors. Please try again later."
      );
    }
  }

  static async getAllLeadFors() {
    try {
      const response = await api.get(`/company/lead-for/all`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch all lead fors. Please try again later.");
    }
  }
}

export default LeadForServices;
