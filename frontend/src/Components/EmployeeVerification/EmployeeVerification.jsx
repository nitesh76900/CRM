import React, { useState, useEffect } from "react";
import {
  getUnverifiedEmployees,
  getVerifiedEmployees,
  rejectEmployeeVerification,
  verifyEmployee,
} from "../../services/employeeServices";
import { ToastContainer, toast } from "react-toastify";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black opacity-50"
          onClick={onClose}
        ></div>
        <div className="relative bg-white rounded-lg w-full max-w-2xl p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

const EmployeeVerification = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [roleName, setRoleName] = useState("");
  const [team, setTeam] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejecting, setRejecting] = useState({});
  const [permissions, setPermissions] = useState({
    leads: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    tasks: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    attendance: {
      create: false,
      read: false,
    },
    meeting: {
      create: false,
      read: false,
      update: false,
      delete: false,
    },
    todos: {
      read: false,
    },
  });

  useEffect(() => {
    fetchData();
    fetchEmp();
  }, []);

  const fetchEmp = async () => {
    const res = await getVerifiedEmployees();
    setEmployeesList(res.data);
  };

  const fetchData = async () => {
    try {
      const response = await getUnverifiedEmployees();
      if (response.data) {
        setEmployees(response.data);
      }
    } catch (error) {
      if (employees.length === 0) {
        // toast.warn("data not available")
      } else {
        toast.error("Error fetching data:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyClick = (employee) => {
    setSelectedEmployee(employee);
    setShowModal(true);
  };

  const resetForm = () => {
    setRoleName("");
    setTeam(null);
    setPermissions({
      leads: { create: false, read: false, update: false, delete: false },
      tasks: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
      meeting: { create: false, read: false, update: false, delete: false },
      attendance: { create: false, read: false },
      todos: { read: false },
    });
  };

  const toggleAllPermissions = (checked) => {
    setPermissions((prev) => {
      const newPermissions = { ...prev };
      for (const module in newPermissions) {
        for (const action in newPermissions[module]) {
          newPermissions[module][action] = checked;
        }
      }
      return newPermissions;
    });
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

  const handleVerify = async () => {
    console.log("team", team);
    if (!roleName.trim()) {
      toast.error("Please enter a role name");
      return;
    }

    setVerifying((prev) => ({ ...prev, [selectedEmployee._id]: true }));
    try {
      // Update this line to include the team parameter
      await verifyEmployee(selectedEmployee._id, roleName, permissions, team);
      setEmployees((prev) =>
        prev.filter((emp) => emp._id !== selectedEmployee._id)
      );
      setShowModal(false);
      resetForm();
      toast.success("Employee verified successfully");
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error?.response?.data.message || "Failed to verify employee");
    } finally {
      setVerifying((prev) => ({ ...prev, [selectedEmployee._id]: false }));
      setIsSubmitting(false);
    }
  };

  const handleReject = async (employee) => {
    setRejecting((prev) => ({ ...prev, [employee._id]: true }));
    try {
      await rejectEmployeeVerification(employee._id);
      setEmployees((prev) => prev.filter((emp) => emp._id !== employee._id));
      toast.success("Employee rejected successfully");
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data.message || "Failed to reject employee");
    } finally {
      setRejecting((prev) => ({ ...prev, [employee._id]: false }));
    }
  };

  const isAllChecked = () => {
    for (const module in permissions) {
      for (const action in permissions[module]) {
        if (!permissions[module][action]) return false;
      }
    }
    return true;
  };

  const isModuleChecked = (module) => {
    return Object.values(permissions[module]).every((value) => value === true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleSelectChange = (e) => {
    setTeam(
      Array.from(e.target.selectedOptions, (option) => option.value || null)
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Employee Verification
        </h1>
        <p className="mt-2 text-gray-600">
          Verify employees and assign their roles
        </p>
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No unverified employees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Employee
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {employees.map((employee) => (
                <tr key={employee._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-600 font-medium">
                            {employee.user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="font-medium text-gray-900">
                          {employee.user.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {employee.user.email}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleVerifyClick(employee)}
                      disabled={verifying[employee._id]}
                      className={`px-4 py-2 rounded-md text-sm font-medium text-white 
                        ${
                          verifying[employee._id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700"
                        }`}
                    >
                      {verifying[employee._id] ? "Verifying..." : "Verify"}
                    </button>
                    <button
                      onClick={() => handleReject(employee)}
                      disabled={rejecting[employee._id]}
                      className={`ml-2 px-4 py-2 rounded-md text-sm font-medium text-white 
                        ${
                          rejecting[employee._id]
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-red-600 hover:bg-red-700"
                        }`}
                    >
                      {rejecting[employee._id] ? "Rejecting..." : "Reject"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Verify Employee</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role Name
              </label>
              <input
                type="text"
                value={roleName}
                onChange={(e) => setRoleName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter role name"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Select Participants
            </label>
            <select
              multiple
              value={team || ""}
              onChange={handleSelectChange}
              className="w-full border rounded-lg px-3 py-2 text-sm min-h-[100px]"
              required
            >
              <option value="">No Team</option>
              {employeesList.map((employee) => (
                <option key={employee.user._id} value={employee.user._id}>
                  {employee.user.name}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl (Windows) or Cmd (Mac) to select multiple employees
            </p>
          </div>

          <div>
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                checked={isAllChecked()}
                onChange={(e) => toggleAllPermissions(e.target.checked)}
                className="h-4 w-4 text-blue-600 rounded border-gray-300"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                All Permissions
              </label>
            </div>

            <div className="space-y-4">
              {Object.entries(permissions).map(([module, actions]) => (
                <div key={module} className="border rounded-md p-4">
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      checked={isModuleChecked(module)}
                      onChange={(e) =>
                        toggleModulePermissions(module, e.target.checked)
                      }
                      className="h-4 w-4 text-blue-600 rounded border-gray-300"
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
                          className="h-4 w-4 text-blue-600 rounded border-gray-300"
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
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={handleVerify}
              disabled={!roleName.trim()}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md
                ${
                  !roleName.trim()
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
            >
              {isSubmitting ? "Verifying..." : "Verify Employee"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeVerification;
