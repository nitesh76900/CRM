// authService.js
import api from "./api";

const authServices = {
  registerSuperAdmin: async (userData) => {
    try {
      const response = await api.post("/auth/register/super-admin", userData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  registerCompany: async (companyData) => {
    try {
      console.log("ggfxghvjctttttttttttttttttttt ");
      for (let pair of companyData.entries()) {
        console.log(pair[0], pair[1]);
      }
      const response = await api.post("/auth/register/company", companyData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  registerEmployee: async (employeeData) => {
    try {
      const response = await api.post("/auth/register/employee", employeeData);
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      return response.data;
    } catch (error) {
      console.log(error)
      throw error.response ? error.response.data : error.message;
    }
  },

  logout: async () => {
    try {
      const response = await api.get("/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

   getProfile: async () => {
    try {
      const response = await api.get("/auth/profile");
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", { email });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  checkToken: async (token) => {
    try {
      const response = await api.post("/auth/check-token", { token });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },

  resetPassword: async (token, newPassword) => {
    try {
      console.log("token", token);
      console.log("newPassword", newPassword);
      const response = await api.put("/auth/reset-password", {
        token,
        newPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response ? error.response.data : error.message;
    }
  },
};

export default authServices;
