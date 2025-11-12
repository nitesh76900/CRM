// src/services/attendanceService.js
import api from "./api"; // Import Axios instance from api.js

const markAttendanceServices = {
  // Get today's attendance for all employees
  getTodayAttendances: async () => {
    try {
      const response = await api.get("/attendance/make-attendance/today");
      return response.data;
    } catch (error) {
      throw (
        error || {
          message: "Failed to fetch today's attendance",
        }
      );
    }
  },

  // Get attendance by specific date
  getAttendanceByDate: async (date) => {
    try {
      const response = await api.get(
        `/attendance/make-attendance/date/${date}`
      ); // Changed to POST as per controller
      return response.data;
    } catch (error) {
      throw (
        error || {
          message: "Failed to fetch attendance by date",
        }
      );
    }
  },

  // Get attendance for a specific employee within a date range
  getEmployeeAttendanceByDateRange: async (employeeId, fromDate, toDate) => {
    try {
      const response = await api.get(
        `/attendance/make-attendance/employee/${employeeId}`,
        {
          params: { fromDate, toDate },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error || {
          message: "Failed to fetch employee attendance",
        }
      );
    }
  },

  // Mark attendance by admin
  markAttendanceByAdmin: async ({
    employeeId,
    date,
    checkIn,
    checkOut,
    isManualEntry,
    status,
    leaveType,
  }) => {
    try {
      console.log("data", {
        employeeId,
        date,
        checkIn,
        checkOut,
        isManualEntry,
        status,
        leaveType,
      });
      const response = await api.post("/attendance/make-attendance/admin", {
        employeeId,
        date,
        checkIn,
        checkOut,
        isManualEntry,
        status,
        leaveType,
      });
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw (
        error || {
          message: "Failed to mark attendance by admin",
        }
      );
    }
  },

  // Mark attendance check-in by assigned employee
  markAttendanceCheckIn: async ({
    employeeId,
    location,
    networkIp,
    checkIn,
    status,
    leaveType,
  }) => {
    try {
      const response = await api.post(
        "/attendance/make-attendance/assign-emp/check-in",
        {
          employeeId,
          location,
          networkIp,
          checkIn,
          status,
          leaveType,
        }
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw error || { message: "Failed to mark check-in" };
    }
  },

  // Mark attendance check-out by assigned employee
  markAttendanceCheckOut: async ({
    attendanceId,
    checkOut,
    location,
    networkIp,
  }) => {
    try {
      const response = await api.post(
        "/attendance/make-attendance/assign-emp/check-out",
        {
          attendanceId,
          checkOut,
          location,
          networkIp,
        }
      );
      return response.data;
    } catch (error) {
      console.log("error", error);
      throw error || { message: "Failed to mark check-out" };
    }
  },

  // Mark self check-in by employee
  markAttendanceBySelfCheckIn: async ({ location, networkIp }) => {
    try {
      const response = await api.post(
        "/attendance/make-attendance/self/check-in",
        {
          location,
          networkIp,
        }
      );
      return response.data;
    } catch (error) {
      throw error || { message: "Failed to mark self check-in" };
    }
  },

  // Mark self check-out by employee
  markAttendanceBySelfCheckOut: async ({ location, networkIp }) => {
    try {
      const response = await api.post(
        "/attendance/make-attendance/self/check-out",
        {
          location,
          networkIp,
        }
      );
      return response.data;
    } catch (error) {
      throw error || { message: "Failed to mark self check-out" };
    }
  },

  getSelfAttendanceByDateRange: async (startDate, endDate) => {
    try {
      const response = await api.get("/attendance/make-attendance/self", {
        params: { startDate, endDate },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error || {
          message: "Failed to fetch self attendance by date range",
        }
      );
    }
  },
  getAttendanceAnalysis: async (month, year) => {
    try {
      const response = await api.get("/attendance/make-attendance/analysis", {
        params: { month, year },
      });
      return response.data;
    } catch (error) {
      console.log(error);
      throw (
        error || {
          message: "Failed to fetch attendance analysis",
        }
      );
    }
  },
};

export default markAttendanceServices;
