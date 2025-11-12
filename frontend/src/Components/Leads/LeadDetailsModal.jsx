// LeadDetailsModal.jsx
import React, { useEffect, useRef, useState } from "react";
import {
  X,
  Phone,
  Mail,
  User,
  Calendar,
  MessageCircle,
  AlarmClock,
} from "lucide-react";
import authServices from "../../services/authServices";
import { addReminder } from "../../services/reminderServices";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";
import { toast, ToastContainer } from "react-toastify";

const LeadDetailsModal = ({ lead, onLeadClick, onClose, onAddFollowUp }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [reminderDateTime, setReminderDateTime] = useState("");
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [conclusion, setConclusion] = useState("");
  // const followUpsRef = useRef(null);
  const [role, setRole] = useState("");
  const [leadsPermissions, setLeadsPermissions] = useState(null);
  const user = useSelector(selectUser);

  const fetchProfile = async () => {
    if (user && user.company) {
      setRole("Employee");
      console.log("response.user.role.permissions", user.role.permissions);
      setLeadsPermissions(user.role.permissions.leads);
    } else if (user.employees) {
      setRole("CompanyAdmin");
    } else if (user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const createReminder = async (message, dateTime) => {
    try {
      const reminderData = {
        type: "Once",
        dateTime: dateTime,
        message: `For lead "${lead.title}": ${message}`,
      };
      const response = await addReminder(reminderData);
      if (response) {
        // toast.success("Reminder created successfully");
      }
    } catch (error) {
      // toast.error("Error creating reminder");
      console.error("Error creating reminder:", error);
      toast.error(error?.response?.data.message || "Error creating reminder");
    }
  };

  const handleSubmitFollowUp = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullConclusion = reminderDateTime
        ? `${conclusion}  \n( Reminder Time: ${new Date(
            reminderDateTime
          ).toLocaleString()})`
        : conclusion;

      await onAddFollowUp(lead._id, fullConclusion);
      if (reminderDateTime) {
        await createReminder(conclusion, reminderDateTime);
      }

      setConclusion("");
      setReminderDateTime("");
      setShowDateTimePicker(false);
      setShowFollowUpForm(false);
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error adding follow-up:");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/40 bg-opacity-40">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">Lead Details</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          {/* Status */}
          <div className="mb-4">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium 
              ${
                lead.status === "New"
                  ? "bg-blue-100 text-blue-800"
                  : lead.status === "Contacted"
                  ? "bg-yellow-100 text-yellow-800"
                  : lead.status === "Qualified"
                  ? "bg-green-100 text-green-800"
                  : lead.status === "Converted"
                  ? "bg-purple-100 text-purple-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {lead.status}
            </span>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Contact Information</h3>
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="mb-2">
                <span className="font-semibold">Name:</span>{" "}
                {lead.contact?.name}
              </div>
              <div className="flex items-center gap-2 mb-2">
                <Phone size={16} />
                <span className="font-semibold">Phone:</span>{" "}
                {lead.contact?.phoneNo}
              </div>
              {lead.contact?.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} />
                  <span className="font-semibold">Email:</span>{" "}
                  {lead.contact?.email}
                </div>
              )}
            </div>
          </div>

          {/* Lead Source & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-md font-medium mb-2">Label</h3>
              <div className="bg-gray-50 p-3 rounded-lg">{lead.for?.name}</div>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Lead Source</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                {lead.source?.name}
              </div>
            </div>
          </div>

          {/* Reference Information */}
          {lead.reference && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">
                Reference Information
              </h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                {lead.reference.name && (
                  <div className="mb-2">
                    <span className="font-semibold">Name:</span>{" "}
                    {lead.reference.name}
                  </div>
                )}
                {lead.reference.phoneNo && (
                  <div className="flex items-center gap-2 mb-2">
                    <Phone size={16} />
                    <span className="font-semibold">Phone:</span>
                    {lead.reference.phoneNo}
                  </div>
                )}
                {lead.reference.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} />
                    <span className="font-semibold">Email:</span>
                    {lead.reference.email}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Assignment & Creation Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <h3 className="text-md font-medium mb-2">Created Information</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <User size={16} />
                  <span>Created by: {lead.createdBy?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Date: {formatDate(lead.createdAt)}</span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-md font-medium mb-2">Assignment</h3>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>
                    Assigned to:{" "}
                    {lead?.assignedTo?.user?.name || "Not assigned"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Remarks */}
          {lead.remark && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Remarks</h3>
              <div className="bg-gray-50 p-3 rounded-lg whitespace-pre-wrap">
                {lead.remark}
              </div>
            </div>
          )}
          <div
            className="flex justify-between items-center mt-3 mb-2"
            // ref={followUpsRef}
          >
            <h3 className="text-lg font-medium">Follow-ups</h3>
            <button
              onClick={() => setShowFollowUpForm(!showFollowUpForm)}
              className={`text-sm px-3 py-1 rounded ${
                role === "CompanyAdmin" || leadsPermissions?.update
                  ? "bg-blue-500 text-white  hover:text-blue-700 cursor-pointer"
                  : "bg-gray-400 text-gray-500 cursor-not-allowed"
              }`}
              disabled={!(role === "CompanyAdmin" || leadsPermissions?.update)}
            >
              Add Follow-up
            </button>
          </div>
          {/* Follow-ups */}
          <div className="mb-4">
            {lead.followUps && lead.followUps.length > 0 ? (
              <div className="space-y-3">
                {lead.followUps.map((followUp) => (
                  <div key={followUp._id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2 text-sm">
                        <MessageCircle size={16} />
                        <span className="font-medium">
                          Follow-up #{followUp.sequence}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(followUp.date)}
                      </span>
                    </div>
                    <p className="text-sm">{followUp.conclusion}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-500 italic">
                No follow-ups recorded yet.
              </div>
            )}

            {showFollowUpForm && (
              <form
                onSubmit={handleSubmitFollowUp}
                className="mb-4 bg-gray-50 p-3 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <textarea
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    placeholder="Enter follow-up conclusion..."
                    className="w-full h-20 p-2 border rounded"
                    required
                  />
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setShowDateTimePicker(!showDateTimePicker)}
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-600"
                  >
                    <AlarmClock size={16} />
                    {showDateTimePicker ? "Hide Reminder" : "Add Reminder"}
                  </button>
                </div>

                {showDateTimePicker && (
                  <div className="mb-2">
                    <input
                      type="datetime-local"
                      value={reminderDateTime}
                      onChange={(e) => setReminderDateTime(e.target.value)}
                      className="w-full p-2 border rounded"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowFollowUpForm(false);
                      setShowDateTimePicker(false);
                      setReminderDateTime("");
                    }}
                    className="px-3 py-1 text-sm border rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:bg-blue-300"
                  >
                    {isSubmitting ? "Saving..." : "Save"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
