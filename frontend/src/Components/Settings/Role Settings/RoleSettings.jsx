import React, { useState, useEffect } from "react";
import { Check, AlertCircle, Shield } from "lucide-react";
import { RoleServices } from "../../../services/roleServices";
import { ToastContainer, toast } from "react-toastify";

const RoleSettings = () => {
  const [roles, setRoles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setIsLoading(true);
      const response = await RoleServices.getAllRoles();
      console.log("response", response);
      setRoles(response.data);
    } catch (error) {
      toast.error("Failed to fetch roles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (role) => {
    try {
      setIsLoading(true);
      const response = await RoleServices.toggleActiveRole(role._id);
      if (response.status) {
        toast.success(response.message);
        fetchRoles();
      } else {
        toast.error(response.error || "Failed to toggle role status");
      }
    } catch (error) {
      toast.error("Failed to toggle role status. Please try again.");
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
                Role Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage user roles and their active status
              </p>
            </div>
          </div>

          {/* Alerts */}
          {/* {error && (
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
          )} */}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">
                    Role Name
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
                {roles.map((role) => (
                  <tr
                    key={role._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Shield size={20} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {role.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          role.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {role.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <ToggleSwitch
                          isActive={role.isActive}
                          onToggle={() => handleToggleStatus(role)}
                          disabled={isLoading}
                        />
                        <span className="text-sm text-gray-500">
                          {role.isActive ? "Deactivate" : "Activate"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
                {roles.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No roles found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSettings;
