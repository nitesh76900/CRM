export const handleApiError = (error) => {
  const defaultError = {
    status: false,
    message: "Something went wrong",
    error: null,
    data: null,
  };

  if (error.response) {
    // Server responded with error
    return {
      status: false,
      message: error.response.data.message || defaultError.message,
      error: error.response.data.error || error.response.data,
      data: null,
    };
  } else if (error.request) {
    // Request made but no response
    return {
      status: false,
      message: "No response from server",
      error: error.request,
      data: null,
    };
  } else {
    // Request setup error
    return {
      status: false,
      message: error.message || defaultError.message,
      error: error,
      data: null,
    };
  }
};

// roleService.js
import api from "./api";
// import { handleApiError } from "./apiResponse";

export const RoleServices = {
  createRole: async (roleData) => {
    try {
      console.log("roleData", roleData);
      const response = await api.post("/company/role", roleData);
      return {
        status: true,
        message: response.data.message,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getAllRoles: async () => {
    try {
      const response = await api.get("/company/role/all");
      return {
        status: true,
        message: "Roles fetched successfully",
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getActiveRoles: async () => {
    try {
      const response = await api.get("/company/role/active");
      return {
        status: true,
        message: "Active roles fetched successfully",
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  getRoleById: async (roleId) => {
    try {
      const response = await api.get(`/company/role/${roleId}`);
      return {
        status: true,
        message: "Role details fetched successfully",
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  updateRole: async (roleId, roleData) => {
    try {
      const response = await api.put(`/company/role/${roleId}`, roleData);
      return {
        status: true,
        message: response.data.message,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },

  toggleActiveRole: async (roleId) => {
    try {
      const response = await api.patch(`/company/role/${roleId}`);
      return {
        status: true,
        message: response.data.message,
        data: response.data.data,
        error: null,
      };
    } catch (error) {
      return handleApiError(error);
    }
  },
};
