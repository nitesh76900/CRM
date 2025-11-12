// services/todoServices.js
import api from "./api";

export const todoServices = {
  createTodo: async (todoData) => {
    try {
      const response = await api.post("/todo", todoData);
      return response.data;
    } catch (error) {
      console.error("Error creating todo:", error);
      throw error;
    }
  },

  updateTodo: async (todoId, todoData) => {
    try {
      const response = await api.put(`/todo/${todoId}`, todoData);
      return response.data;
    } catch (error) {
      console.error("Error updating todo:", error);
      throw error;
    }
  },

  getAllTodos: async (queryString = "") => {
    try {
      const response = await api.get(
        `/todo/all${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all todos:", error);
      throw error;
    }
  },

  getTeamTodos: async () => {
    try {
      const response = await api.get("/todo/team-todo");
      return response.data;
    } catch (error) {
      console.error("Error fetching all todos:", error);
      throw error;
    }
  },

  getTodos: async (queryString = "") => {
    try {
      const response = await api.get(
        `/todo${queryString ? `?${queryString}` : ""}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching todos:", error);
      throw error;
    }
  },

  markTodoDone: async (todoId, conclusion) => {
    try {
      const response = await api.put(`/todo/${todoId}`, { conclusion });
      return response.data;
    } catch (error) {
      console.error("Error marking todo as done:", error);
      throw error;
    }
  },
};
