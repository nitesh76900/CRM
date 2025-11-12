import React, { useState, useEffect } from "react";
import { Check, AlertCircle, User } from "lucide-react";
import {
  getAllEmployees,
  toggleEmployeeStatus,
} from "../../../services/employeeServices";
import { ToastContainer, toast } from "react-toastify";

const EmployeeSettings = () => {
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getAllEmployees();
      console.log("response.data", response.data);
      // Sort employees by name alphabetically
      const sortedEmployees = response.data.sort((a, b) =>
        a.user.name.localeCompare(b.user.name)
      );
      setEmployees(sortedEmployees);
    } catch (error) {
      toast.error(
        error.message || "Failed to fetch employees. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (employeeId) => {
    try {
      setIsLoading(true);
      const response = await toggleEmployeeStatus(employeeId);
      if (response.status) {
        fetchEmployees(); // Refetch sorted employees after toggling status
        toast.success("Successfully changed the status", response.message);
      } else {
        toast.error(response.error || "Failed to toggle employee status");
      }
    } catch (error) {
      toast.error(
        error.message || "Failed to toggle employee status. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle Switch Component
  const ToggleSwitch = ({ isActive, onToggle, disabled }) => (
    <button
      onClick={onToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        isActive ? "bg-blue-600" : "bg-gray-200"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out ${
          isActive ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <div>
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Employee Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage employees and their active status
              </p>
            </div>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
              <Check size={20} />
              {success}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <td
                colSpan="4"
                className="flex justify-center items-center h-64 "
              >
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
              </td>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Employee Name
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {employees.length > 0 ? (
                    employees.map((employee) => (
                      <tr
                        key={employee._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <User size={20} className="text-blue-600" />
                            <span className="text-sm font-medium text-gray-800">
                              {employee.user.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-gray-800">
                              {employee.user.email}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              employee.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {employee.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <ToggleSwitch
                              isActive={employee.isActive}
                              onToggle={() => handleToggleStatus(employee._id)}
                              disabled={isLoading}
                            />
                            <span className="text-sm text-gray-500">
                              {employee.isActive ? "Deactivate" : "Activate"}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No employees found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSettings;
