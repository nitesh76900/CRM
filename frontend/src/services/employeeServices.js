import api from "./api";

// ✅ Fetch all employees
export const getAllEmployees = async () => {
  try {
    const response = await api.get("/company/employee/all");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ✅ Fetch verified employees
export const getVerifiedEmployees = async () => {
  try {
    const response = await api.get("/company/employee/verify");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ✅ Fetch unverified employees
export const getUnverifiedEmployees = async () => {
  try {
    const response = await api.get("/company/employee/unverify");
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ✅ Fetch employee by ID
export const getEmployeeById = async (employeeId) => {
  try {
    const response = await api.get(`/company/employee/profile/${employeeId}`);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// ✅ Verify Employee and Assign Role
export const verifyEmployee = async (employeeId, roleName, permissions, team) => {
  try {
    const response = await api.post("/company/employee/verification", {
      employeeId,
      roleName,
      permissions,
      team,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ✅ Change Employee active Status
export const toggleEmployeeStatus = async (employeeId) => {
  try {
    console.log("Called");
    const response = await api.put(
      `/company/employee/change-active-status/${employeeId}`
    );
    return response;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};

// Service for updating permissions
export const updateEmployeePermissions = async (
  employeeId,
  roleName,
  permissions,
  team
) => {
  try {
    const response = await api.put("/company/employee/change-permissions", {
      employeeId,
      roleName,
      permissions,
      team
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error.message;
  }
};


export const updateEmployee = async (employeeData, file) => {
  try {
    const formData = new FormData();
    
    // Append form fields if they exist
    if (employeeData.name) formData.append("name", employeeData.name);
    if (employeeData.designation) formData.append("designation", employeeData.designation);
    if (employeeData.phoneNo) formData.append("phoneNo", employeeData.phoneNo);
    
    if (employeeData.address) {
      if (employeeData.address.country) formData.append("address[country]", employeeData.address.country);
      if (employeeData.address.state) formData.append("address[state]", employeeData.address.state);
      if (employeeData.address.city) formData.append("address[city]", employeeData.address.city);
      if (employeeData.address.pincode) formData.append("address[pincode]", employeeData.address.pincode);
    }

    // Append file if provided
    if (file) {
      formData.append("image", file);
    }

    const response = await api.put("/auth/update/employee-profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Something went wrong" };
  }
};

export const rejectEmployeeVerification = async (employeeId) => {
  try {
    const response = await api.post("/company/employee/rejected", {
      employeeId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
