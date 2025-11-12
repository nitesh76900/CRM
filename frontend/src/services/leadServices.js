import api from "./api";

export const createLead = async (leadData) => {
  try {
    console.log("leadData", leadData);
    const response = await api.post("/lead/create", leadData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const updateLead = async (id, leadData) => {
  try {
    const response = await api.put(`/lead/update/${id}`, leadData);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const changeLeadStatus = async (id, status) => {
  try {
    const response = await api.patch(`/lead/status/${id}`, { status });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const getLeads = async (filters) => {
  try {
    const response = await api.get("/lead/list", { params: filters });
    // console.log('response.data', response.data)
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const getLeadById = async (id) => {
  try {
    console.log("id", id);
    const response = await api.get(`/lead/${id}`);
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const addFollowUp = async (id, conclusion) => {
  try {
    const response = await api.post(`/lead/follow-up/add/${id}`, {
      conclusion,
    });
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};

export const updateFollowUp = async (id, followUpId, conclusion) => {
  try {
    const response = await api.put(
      `/lead/follow-up/update/${id}/${followUpId}`,
      { conclusion }
    );
    return response.data;
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Something went wrong!" };
  }
};
