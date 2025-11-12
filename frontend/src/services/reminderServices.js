import api from "./api";

// Add a new reminder
export const addReminder = async (reminderData) => {
  try {
    const response = await api.post("/reminder/add", reminderData);
    return response.data;
  } catch (error) {
    console.error("Error adding reminder:", error);
    throw error;
  }
};

// Delete a reminder by ID
export const deleteReminder = async (reminderId) => {
  try {
    const response = await api.delete(`/reminder/delete/${reminderId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

// Get reminders by date range
export const getRemindersByDateRange = async (startDate, endDate) => {
  try {
    const response = await api.post("/reminder/list", {
      startDate,
      endDate,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reminders by date range:", error);
    throw error;
  }
};
