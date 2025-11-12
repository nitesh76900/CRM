import React, { useState, useEffect } from "react";
import LeadStatusLabelService from "../../../services/leadStatusLabelServices";
import { X, Pencil, Plus, Check, AlertCircle } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";


const Modal = ({ isOpen, isLoading, onClose, title, onSubmit, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        {children}
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? "Processing..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
};

const LeadStatusLabel = () => {
  const [statusLabels, setStatusLabels] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [labelName, setLabelName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStatusLabels();
  }, []);

  const fetchStatusLabels = async () => {
    try {
      setIsLoading(true);
      const response = await LeadStatusLabelService.getAllLeadStatusLabels();
      console.log("response.data", response.data);
      setStatusLabels(response.data);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateLabel = async () => {
    try {
      console.log("labelName", labelName);
      if (!labelName.trim()) {
        toast.error("Status label name is required");
        return;
      }
      setIsLoading(true);
      await LeadStatusLabelService.addLeadStatusLabel({ name: labelName });
      toast.success("Status label created successfully");
      setIsCreateModalOpen(false);
      setLabelName("");
      fetchStatusLabels();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateLabel = async () => {
    try {
      if (!labelName.trim()) {
        toast.error("Status label name is required");
        return;
      }
      setIsLoading(true);
      await LeadStatusLabelService.updateLeadStatusLabel(selectedLabel._id, {
        name: labelName,
      });
      toast.success("Status label updated successfully");
      setIsUpdateModalOpen(false);
      setSelectedLabel(null);
      setLabelName("");
      fetchStatusLabels();
    } catch (error) {
      toast.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
                  <ToastContainer position="top-center" style={{marginTop:"50px"}} autoClose={3000} />
      
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Lead Status Labels
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your lead status workflow labels
              </p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Status Label
            </button>
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
                    Label Name
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {statusLabels.map((label) => (
                  <tr
                    key={label._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                        <span className="text-sm text-gray-800">
                          {label.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedLabel(label);
                          setLabelName(label.name);
                          setIsUpdateModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
                {statusLabels.length === 0 && (
                  <tr>
                    <td
                      colSpan={2}
                      className="px-6 py-8 text-center text-gray-500"
                    >
                      No status labels found. Click the button above to create
                      one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        isLoading={isLoading}
        onClose={() => {
          setIsCreateModalOpen(false);
          setLabelName("");
          toast.error("");
        }}
        title="Create Status Label"
        onSubmit={handleCreateLabel}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Name
            </label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Enter status label name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={isUpdateModalOpen}
        isLoading={isLoading}
        onClose={() => {
          setIsUpdateModalOpen(false);
          setLabelName("");
          setSelectedLabel(null);
          toast.error("");
        }}
        title="Update Status Label"
        onSubmit={handleUpdateLabel}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Label Name
            </label>
            <input
              type="text"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              placeholder="Enter status label name"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LeadStatusLabel;
