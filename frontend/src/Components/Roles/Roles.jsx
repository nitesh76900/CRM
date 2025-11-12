import React, { useState, useEffect } from "react";
import { RoleServices } from "../../services/roleServices";
import { X, Edit, Eye, Plus } from "lucide-react";

// Separate RoleForm component
const RoleForm = ({ isEditing, formData, setFormData, onSubmit, onClose }) => {
  return (
    <div className="fixed inset-0  bg-gray-500/40 shadow-2xl bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isEditing ? "Update Role" : "Create Role"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="mb-6">
            <label className="block mb-2 font-medium">Role Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-6">
            <h3 className="font-medium mb-4">Permissions</h3>
            {Object.entries(formData.permissions).map(
              ([module, permissions]) => (
                <div key={module} className="mb-4">
                  <h4 className="capitalize font-medium mb-2">{module}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(permissions).map(([permission, value]) => (
                      <label
                        key={permission}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              permissions: {
                                ...formData.permissions,
                                [module]: {
                                  ...formData.permissions[module],
                                  [permission]: e.target.checked,
                                },
                              },
                            })
                          }
                          className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="capitalize">{permission}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
            >
              {isEditing ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Separate ViewRoleModal component
const ViewRoleModal = ({ selectedRole, onClose }) => (
  <div className="fixed inset-0 bg-gray-500/40 bg-opacity-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Role Details</h2>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div>
        <h3 className="text-xl font-medium mb-2">{selectedRole.name}</h3>

        <div className="mt-4">
          <h4 className="font-medium mb-2">Permissions</h4>
          {Object.entries(selectedRole.permissions).map(
            ([module, permissions]) => (
              <div key={module} className="mb-4">
                <h5 className="capitalize font-medium text-gray-700">
                  {module}
                </h5>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(permissions).map(([permission, value]) => (
                    <div
                      key={permission}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className={`w-4 h-4 rounded-full ${
                          value ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></span>
                      <span className="capitalize">{permission}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  </div>
);

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    permissions: {
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
      meeting: {
        create: false,
        read: false,
        update: false,
        delete: false,
      },
    },
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    const response = await RoleServices.getActiveRoles();
    if (response.status) {
      setRoles(response.data);
    }
  };

  const handleCreateOrUpdate = async (e) => {
    e.preventDefault();
    console.log("formData", formData);
    const response = isEditing
      ? await RoleServices.updateRole(selectedRole._id, formData)
      : await RoleServices.createRole(formData);

    if (response.status) {
      setIsModalOpen(false);
      fetchRoles();
      resetForm();
    }
  };

  const handleEdit = async (role) => {
    const response = await RoleServices.getRoleById(role._id);
    console.log("response", response);
    if (response.status) {
      setFormData(response.data);
      setSelectedRole(response.data);
      setIsEditing(true);
      setIsModalOpen(true);
    }
  };

  const handleView = async (role) => {
    const response = await RoleServices.getRoleById(role._id);
    if (response.status) {
      setSelectedRole(response.data);
      setIsViewModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      permissions: {
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
        meeting: {
          create: false,
          read: false,
          update: false,
          delete: false,
        },
      },
    });
    setSelectedRole(null);
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Role Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-600 transition-colors"
        >
          <Plus size={20} />
          <span>Create Role</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Role Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                Created At
              </th>
              <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{role.name}</td>
                <td className="px-6 py-4">
                  {new Date(role.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(role)}
                      className="text-gray-600 hover:text-blue-600"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(role)}
                      className="text-gray-600 hover:text-green-600"
                    >
                      <Edit size={20} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <RoleForm
          isEditing={isEditing}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleCreateOrUpdate}
          onClose={handleCloseModal}
        />
      )}

      {isViewModalOpen && selectedRole && (
        <ViewRoleModal
          selectedRole={selectedRole}
          onClose={() => setIsViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default RoleManagement;
