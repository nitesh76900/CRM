import api from "./api";

export const taskServices = {
  // Create new task
  createTask: async (taskData) => {
    try {
      const response = await api.post("/task-assigned/create", taskData);
      return response.data;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error; // Re-throw the error to be handled by the calling function
    }
  },

  // Update existing task
  updateTask: async (taskId, taskData) => {
    try {
      const response = await api.put(
        `/task-assigned/update/${taskId}`,
        taskData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  },

  // Add conclusion to task
  addConclusion: async (taskId, conclusion) => {
    if (!taskId) {
      console.error("❌ Task ID is missing!");
      return;
    }

    try {
      const response = await api.put(`/task-assigned/conclusion/${taskId}`, {
        conclusion,
      });

      return response.data;
    } catch (error) {
      console.error("❌ Error adding conclusion to task:", error);
      throw error;
    }
  },

  // Get all tasks with filters
  getAllTasks: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const response = await api.get(`/task-assigned/all?${queryParams}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching all tasks:", error);
      throw error;
    }
  },

  // Get tasks assigned to logged-in user
  getMyTasks: async () => {
    try {
      const response = await api.get("/task-assigned");
      // console.log('response.data', response.data)
      return response.data;
    } catch (error) {
      console.error("Error fetching user tasks:", error);
      throw error;
    }
  },
};

export default taskServices;
