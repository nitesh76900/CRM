import api from "../services/api";

const API_BASE_URL = "/super-admin/company";

// Function to verify a company
export const verifyCompany = async (companyId) => {
  try {
    const response = await api.put(`${API_BASE_URL}/verify/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error verifying company:", error);
    throw error.response?.data || error.message;
  }
};

// Function to fetch all verified companies
export const getVerifiedCompanies = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/verify`);
    return response.data;
  } catch (error) {
    console.error("Error fetching verified companies:", error);
    throw error.response?.data || error.message;
  }
};

// Function to fetch all unverified companies
export const getUnverifiedCompanies = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/unverify`);
    return response.data;
  } catch (error) {
    console.error("Error fetching unverified companies:", error);
    throw error.response?.data || error.message;
  }
};

// Function to toggle company active/inactive status
export const toggleCompanyStatus = async (companyId) => {
  try {
    console.log(companyId);
    const response = await api.patch(`${API_BASE_URL}/change-status`, {
      companyId,
    });
    console.log("call toggle status");
    return response.data;
  } catch (error) {
    console.error("Error toggling company status:", error);
    throw error.response?.data || error.message;
  }
};

// Function to fetch all companies
export const getAllCompanies = async () => {
  try {
    const response = await api.get(`${API_BASE_URL}/all`);
    return response.data;
  } catch (error) {
    console.error("Error fetching all companies:", error);
    throw error.response?.data || error.message;
  }
};

export const getSuperAdminDashboardData = async () => {
  try {
    const response = await api.get("/super-admin/dashboard");
    return response.data;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    throw error;
  }
};

export const getCompanyInfo = async (companyId) => {
  try {
    console.log(companyId);
    const response = await api.get(`/super-admin/company/info/${companyId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching company info:", error);
    throw error;
  }
};

export const rejectedVerificationsCompany = async (companyId) => {
  try {
      const response = await api.put(`/super-admin/company/rejected/${companyId}`);
      return response.data;
  } catch (error) {
      console.error("Error rejecting company verification:", error);
      throw error;
  }
};

 

export default {
  verifyCompany,
  getVerifiedCompanies,
  getUnverifiedCompanies,
  toggleCompanyStatus,
  getAllCompanies,
  getSuperAdminDashboardData,
  getCompanyInfo,
  rejectedVerificationsCompany,
};
