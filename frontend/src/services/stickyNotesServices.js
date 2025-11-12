import api from "./api";

// 📌 **Add a Sticky Note**
export const addStickyNote = async (noteData) => {
  try {
    const response = await api.post("/sticky-note/add", noteData);
    return response.data; // Return success response
  } catch (error) {
    console.error("Error adding sticky note:", error);
    throw (
      error.response?.data || {
        message: "An error occurred while adding the sticky note",
      }
    );
  }
};

export const getStickyNotes = async () => {
  try {
    const response = await api.get("/sticky-note/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching sticky note:", error);
    throw (
      error.response?.data || {
        message: "An error occurred while fetching the sticky note",
      }
    );
  }
};

// 📌 **Delete a Sticky Note**
export const deleteStickyNote = async (noteId) => {
  try {
    const response = await api.delete(`/sticky-note/delete/${noteId}`);
    return response.data; // Return success response
  } catch (error) {
    console.error("Error deleting sticky note:", error);
    throw (
      error.response?.data || {
        message: "An error occurred while deleting the sticky note",
      }
    );
  }
};
