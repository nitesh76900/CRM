import React, { useState, useEffect } from "react";
import {
  getVerifiedEmployees,
  updateEmployeePermissions,
} from "../../../services/employeeServices";
import { toast, ToastContainer } from "react-toastify";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Loading spinner component
const LoadingSpinner = () => (
  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
);

const EmployeePermissions = () => {
  const [employees, setEmployees] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [permissions, setPermissions] = useState({
    leads: { create: false, read: false, update: false, delete: false },
    tasks: { create: false, read: false, update: false, delete: false },
    meeting: { create: false, read: false, update: false, delete: false },
    todos: { read: false },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [team, setTeam] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await getVerifiedEmployees();
      // Sort employees by name alphabetically
      const sortedEmployees = response.data.sort((a, b) =>
        a.user.name.localeCompare(b.user.name)
      );
      setEmployees(sortedEmployees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error(error.message || "Error fetching employees:");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateClick = (employee) => {
    console.log("team", employee);
    setSelectedEmployee(employee);
    setRoleName(employee.role.name);
    setPermissions(employee.role.permissions);
    setTeam(
      employee?.team
        ? Object.values(employee.team).map((member) => member._id)
        : []
    );
    setShowModal(true);
  };

  const isAllChecked = () => {
    return Object.values(permissions).every((modulePerms) =>
      Object.values(modulePerms).every((value) => value === true)
    );
  };

  const isModuleChecked = (module) => {
    return Object.values(permissions[module]).every((value) => value === true);
  };

  const toggleAllPermissions = (checked) => {
    const newPermissions = {};
    Object.keys(permissions).forEach((module) => {
      newPermissions[module] = {};
      Object.keys(permissions[module]).forEach((action) => {
        newPermissions[module][action] = checked;
      });
    });
    setPermissions(newPermissions);
  };

  const toggleModulePermissions = (module, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: Object.keys(prev[module]).reduce(
        (acc, action) => ({
          ...acc,
          [action]: checked,
        }),
        {}
      ),
    }));
  };

  const togglePermission = (module, action, checked) => {
    setPermissions((prev) => ({
      ...prev,
      [module]: {
        ...prev[module],
        [action]: checked,
        read: action !== "read" && checked ? true : prev[module].read,
      },
    }));
  };

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      console.log("Updating Employee ID:", selectedEmployee._id);
      console.log("Updated Team IDs:", team);

      const response = await updateEmployeePermissions(
        selectedEmployee._id,
        roleName,
        permissions,
        team
      );

      console.log("API Response:", response); // Check if backend updates data

      await fetchEmployees(); // Ensure updated data is fetched
      setShowModal(false);
    } catch (error) {
      console.error(error.message || "Error updating permissions:");
      toast.error("Error updating permissions");
    } finally {
      setIsUpdating(false);
      toast.success("Successfully updated permissions");
    }
  };

  const handleSelectChange = (event) => {
    const selectedValues = Array.from(
      event.target.selectedOptions,
      (option) => option.value
    );
    setTeam(selectedValues);
  };

  return (
    <div className="p-6">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        style={{ marginTop: "50px" }}
      />
      <h1 className="text-2xl font-bold mb-6">Employee Permissions</h1>

      <div className="overflow-x-auto">
        {isLoading ? (
          <td colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </td>
        ) : (
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                  Name
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                  Email
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                  Designation
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                  Role
                </th>
                <th className="px-6 py-3 border-b border-gray-200 text-left text-sm font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.length > 0 ? (
                employees.map((employee) => (
                  <tr key={employee._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 border-b border-gray-200">
                      {employee.user.name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      {employee.user.email}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      {employee.designation}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      {employee.role.name}
                    </td>
                    <td className="px-6 py-4 border-b border-gray-200">
                      <button
                        onClick={() => handleUpdateClick(employee)}
                        className="px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50"
                      >
                        Update Permissions
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No employees found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => !isUpdating && setShowModal(false)}
      >
        <div className="space-y-6 p-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Update Permissions</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                disabled={isUpdating}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Enter role name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Team
            </label>
            <select
              multiple
              value={team}
              onChange={handleSelectChange}
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
              required
            >
              {employees.map((employee) => (
                <option key={employee.user._id} value={employee.user._id}>
                  {employee.user.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple employees
            </p>

            {/* Display Selected Employees */}
            <div className="mt-2 text-sm">
              Selected Employees:{" "}
              {employees
                .filter((emp) => team.includes(emp.user._id))
                .map((emp) => emp.user.name)
                .join(", ")}
            </div>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isAllChecked()}
                onChange={(e) => toggleAllPermissions(e.target.checked)}
                disabled={isUpdating}
                className="h-4 w-4 text-blue-600 rounded border-gray-300 disabled:cursor-not-allowed"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                All Permissions
              </label>
            </div>

            <div className="space-y-4">
              {Object.entries(permissions).map(([module, actions]) => (
                <div key={module} className="border rounded p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={isModuleChecked(module)}
                      onChange={(e) =>
                        toggleModulePermissions(module, e.target.checked)
                      }
                      disabled={isUpdating}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 disabled:cursor-not-allowed"
                    />
                    <label className="ml-2 text-sm font-medium text-gray-700 capitalize">
                      {module}
                    </label>
                  </div>
                  <div className="ml-6 grid grid-cols-2 gap-2">
                    {Object.entries(actions).map(([action, value]) => (
                      <div
                        key={`${module}-${action}`}
                        className="flex items-center"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            togglePermission(module, action, e.target.checked)
                          }
                          disabled={isUpdating}
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 disabled:cursor-not-allowed"
                        />
                        <label className="ml-2 text-sm text-gray-600 capitalize">
                          {action}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowModal(false)}
              disabled={isUpdating}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleUpdate}
              disabled={!roleName.trim() || isUpdating}
              className={`px-4 py-2 text-sm font-medium text-white rounded flex items-center justify-center min-w-[120px]
                ${
                  !roleName.trim() || isUpdating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isUpdating ? (
                <>
                  <LoadingSpinner />
                  <span className="ml-2">Updating...</span>
                </>
              ) : (
                "Update Permissions"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeePermissions;
