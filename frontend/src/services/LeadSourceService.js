import api from "./api";

class LeadSourceService {
  static async addLeadSource(data) {
    try {
      const response = await api.post("/company/lead-source", data);
      return response.data;
    } catch (error) {
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error("Failed to add lead source. Please try again later.");
    }
  }

  static async updateLeadSource(leadSourceId, data) {
    try {
      const response = await api.put(
        `/company/lead-source/${leadSourceId}`,
        data
      );
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(error.response.data.message || "Lead source not found");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "All fields are required"
        );
      }
      throw new Error("Failed to update lead source. Please try again later.");
    }
  }

  static async toggleActiveLeadSource(leadSourceId) {
    try {
      const response = await api.patch(`/company/lead-source/${leadSourceId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error(error.response.data.message || "Lead source not found");
      }
      throw new Error(
        "Failed to toggle lead source status. Please try again later."
      );
    }
  }

  static async getActiveLeadSources() {
    try {
      const response = await api.get("/company/lead-source");
      return response.data;
    } catch (error) {
      throw new Error(
        "Failed to fetch active lead sources. Please try again later."
      );
    }
  }

  static async getAllLeadSources() {
    try {
      const response = await api.get(`/company/lead-source/all`);
      return response.data;
    } catch (error) {
      throw new Error(
        "Failed to fetch all lead sources. Please try again later."
      );
    }
  }
}

export default LeadSourceService;
