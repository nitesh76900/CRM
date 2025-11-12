import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import LeadForServices from "../../services/LeadForServices";
import LeadSourceService from "../../services/LeadSourceService";
import { getVerifiedEmployees } from "../../services/employeeServices";
import { getLeadById } from "../../services/leadServices";

const LeadFormModal = ({
  show,
  onClose,
  isEdit = false,
  leadId = null,
  onSubmit,
}) => {
  const [leadFors, setLeadFors] = useState([]);
  const [leadSources, setLeadSources] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    leadForId: "",
    leadSourceId: "",
    contact: {
      name: "",
      email: "",
      phoneNo: "",
    },
    reference: {
      name: "",
      email: "",
      phoneNo: "",
    },
    status: isEdit ? "" : "New",
    remark: "",
    assignedTo: null,
  });

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        setLoading(true);

        const [leadForsRes, leadSourcesRes, employeesRes] = await Promise.all([
          LeadForServices.getActiveLeadFors(),
          LeadSourceService.getActiveLeadSources(),
          getVerifiedEmployees(),
        ]);

        setLeadFors(leadForsRes.data || []);
        setLeadSources(leadSourcesRes.data || []);
        setEmployees(employeesRes.data || []);

        if (isEdit && leadId) {
          const leadRes = await getLeadById(leadId);
          const lead = leadRes.data;

          setFormData({
            title: lead.title,
            leadForId: lead.for._id,
            leadSourceId: lead.source._id,
            contact: {
              name: lead.contact.name,
              email: lead.contact.email,
              phoneNo: lead.contact.phoneNo,
            },
            reference: lead.reference || {
              name: "",
              email: "",
              phoneNo: "",
            },
            status: lead.status,
            remark: lead.remark || "",
            assignedTo: lead.assignedTo ? lead.assignedTo._id : null,
          });
        }
      } catch (error) {
        console.error("Error fetching form data:", error);
        toast.error("Error fetching form data");
      } finally {
        setLoading(false);
      }
    };

    if (show) {
      fetchFormData();
    }
  }, [show, isEdit, leadId]);

  useEffect(() => {
    if (!show) {
      setFormData({
        title: "",
        leadForId: "",
        leadSourceId: "",
        contact: { name: "", email: "", phoneNo: "" },
        reference: { name: "", email: "", phoneNo: "" },
        status: "New",
        remark: "",
        assignedTo: null,
      });
    }
  }, [show]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("contact.") || name.startsWith("reference.")) {
      const [type, field] = name.split(".");
      setFormData({
        ...formData,
        [type]: {
          ...formData[type],
          [field]: value,
        },
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEdit) {
        await onSubmit(formData, leadId);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(error.message || "Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 bg-opacity-40 flex justify-center items-center z-50">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold">
            {isEdit ? "Update Lead" : "Add New Lead"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="p-6 overflow-y-auto"
            style={{ maxHeight: "calc(90vh - 8rem)" }}
          >
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded-md"
                  required
                  placeholder="Enter lead title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Label
                  </label>
                  <select
                    name="leadForId"
                    value={formData.leadForId}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border rounded-md"
                    required
                  >
                    <option value="">Select Label</option>
                    {leadFors.map((leadFor) => (
                      <option key={leadFor._id} value={leadFor._id}>
                        {leadFor.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Lead Source
                  </label>
                  <select
                    name="leadSourceId"
                    value={formData.leadSourceId}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border rounded-md"
                    required
                  >
                    <option value="">Select Lead Source</option>
                    {leadSources.map((source) => (
                      <option key={source._id} value={source._id}>
                        {source.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Contact Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="contact.name"
                      placeholder="Contact Name"
                      value={formData.contact.name}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="contact.email"
                      placeholder="Contact Email"
                      value={formData.contact.email}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="tel"
                      name="contact.phoneNo"
                      placeholder="Contact Phone"
                      value={formData.contact.phoneNo}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                      required
                      pattern="\d{10,15}"
                      title="Phone number must be between 10 to 15 digits"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Reference Information (Optional)
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      name="reference.name"
                      placeholder="Reference Name"
                      value={formData.reference.name}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="reference.email"
                      placeholder="Reference Email"
                      value={formData.reference.email}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="tel"
                      name="reference.phoneNo"
                      placeholder="Reference Phone"
                      value={formData.reference.phoneNo}
                      onChange={handleInputChange}
                      className="w-full p-2 text-sm border rounded-md"
                      pattern="\d{10,15}"
                      title="Phone number must be between 10 to 15 digits"
                    />
                  </div>
                </div>
              </div>

              {isEdit && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 text-sm border rounded-md"
                    required
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo || ""}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded-md"
                >
                  <option value="">Select Employee</option>
                  {employees.map((employee) => (
                    <option key={employee._id} value={employee._id}>
                      {employee.user?.name || employee.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Remarks
                </label>
                <textarea
                  name="remark"
                  value={formData.remark}
                  onChange={handleInputChange}
                  className="w-full p-2 text-sm border rounded-md"
                  rows={3}
                  placeholder="Enter any additional remarks..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              >
                {isSubmitting
                  ? isEdit
                    ? "Updating..."
                    : "Creating..."
                  : isEdit
                  ? "Update Lead"
                  : "Create Lead"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default LeadFormModal;
