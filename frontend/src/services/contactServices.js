// services/contactServices.js
import api from "./api";

const contactServices = {
  // Add new contact
  addContact: async (contactData) => {
    try {
      const formData = new FormData();

      // Append text data (excluding address and businessCard)
      Object.keys(contactData).forEach((key) => {
        if (key !== "businessCard" && key !== "address") {
          formData.append(key, contactData[key]);
        }
      });

      // Append address fields separately
      if (contactData.address) {
        Object.keys(contactData.address).forEach((key) => {
          formData.append(`address[${key}]`, contactData.address[key]);
        });
      }

      // Append file if it exists
      if (contactData.businessCard) {
        formData.append("businessCard", contactData.businessCard);
      }

      const response = await api.post("/contact/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update existing contact
  updateContact: async (id, contactData) => {
    try {
      const formData = new FormData();

      // Append text data (excluding address and businessCard)
      Object.keys(contactData).forEach((key) => {
        if (key !== "businessCard" && key !== "address") {
          formData.append(key, contactData[key]);
        }
      });

      // Append address fields separately
      if (contactData.address) {
        Object.keys(contactData.address).forEach((key) => {
          formData.append(`address[${key}]`, contactData.address[key]);
        });
      }

      // Append file if it exists
      if (contactData.businessCard) {
        formData.append("businessCard", contactData.businessCard);
      }

      const response = await api.put(`/contact/update/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Toggle client status
  toggleClientStatus: async (id) => {
    try {
      const response = await api.patch(`/contact/toggle-client/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get contacts with search and filters
  getContacts: async (params = {}) => {
    try {
      const { search, isClient, page = 1, limit = 10 } = params;
      const queryParams = new URLSearchParams();

      // Add search parameters if they exist
      if (search) queryParams.append("search", search);
      if (isClient !== undefined) queryParams.append("isClient", isClient);
      queryParams.append("page", page);
      queryParams.append("limit", limit);

      const response = await api.get(`/contact?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },
};

export default contactServices;
