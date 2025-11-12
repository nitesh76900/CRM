import api from "./api";

export async function getCompanies() {
  try {
    const response = await api.get("/company");
    return response.data;
  } catch (error) {
    console.error("Error fetching companies:", error);
    throw error;
  }
}

export default async function updateCompany(companyData, file) {
  try {
    const formData = new FormData();

    // Append form fields if they exist
    if (companyData.name) formData.append("name", companyData.name);
    if (companyData.designation)
      formData.append("designation", companyData.designation);
    if (companyData.phoneNo) formData.append("phoneNo", companyData.phoneNo);

    // For address, if present, append its fields individually
    if (companyData.address) {
      if (companyData.address.country)
        formData.append("address[country]", companyData.address.country);
      if (companyData.address.state)
        formData.append("address[state]", companyData.address.state);
      if (companyData.address.city)
        formData.append("address[city]", companyData.address.city);
      if (companyData.address.pincode)
        formData.append("address[pincode]", companyData.address.pincode);
    }

    // Append file if provided (company logo, image, etc.)
    if (file) {
      formData.append("image", file);
    }

    // Make the API call to update company
    const response = await api.put("/company/update", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error updating company:", error);
    throw error.response?.data || { message: "Something went wrong" };
  }
}

export async function updateNodemailerCredentials(data) {
  try {
    const response = await api.put("/company/add-send-mail-credentials", data);
    return response.data;
  } catch (error) {
    console.error("Error updating nodemailer credentials:", error);
    throw error;
  }
}

export async function getNodemailerCredentials() {
  try {
    const response = await api.get("/company/send-mail-credentials");
    return response.data;
  } catch (error) {
    console.error("Error fetching nodemailer credentials:", error);
    throw error;
  }
}
