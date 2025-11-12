import React, { useState, useEffect } from "react";
import { XCircle } from "lucide-react";
import meetingServices from "../../services/meetingServices";
import { getVerifiedEmployees } from "../../services/employeeServices";
import { getLeads } from "../../services/leadServices";
import { toast, ToastContainer } from "react-toastify";
const MeetingForm = ({ meeting, onClose, onSuccess }) => {
  console.log("meeting", meeting);
  const [formData, setFormData] = useState({
    title: meeting?.title || "",
    participants: meeting?.participants
      ? meeting.participants.map((p) => p._id)
      : [],
    scheduledTime: meeting?.scheduledTime
      ? new Date(meeting.scheduledTime).toISOString().slice(0, 16)
      : "",
    agenda: meeting?.agenda || "",
    addClient: meeting?.addParticipants
      ? meeting.addParticipants.map((p) => ({
          name: p.name,
          email: p.email,
          phoneNo: p.phoneNo || "",
        }))
      : [],
    addressAndLink: meeting?.addressAndLink || "",
    forLead: meeting?.forLead?._id || null,
  });

  const [employees, setEmployees] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [employeesData, leadsData] = await Promise.all([
          getVerifiedEmployees(),
          getLeads(),
        ]);
        console.log("employeesData", employeesData);
        console.log("leadData", leadsData);
        setEmployees(employeesData.data || []);
        setLeads(leadsData.data || []);
      } catch (error) {
        toast.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    console.log("formData", formData);
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (meeting) {
        await meetingServices.updateMeeting(meeting._id, formData);
      } else {
        await meetingServices.createMeeting(formData);
      }
      onSuccess();
      toast.success("save meeting successfully");
    } catch (error) {
      toast.error(error || "Error saving meeting:");
    } finally {
      setIsSubmitting(false);
    }
  };

  const addParticipant = () => {
    setFormData({
      ...formData,
      addClient: [...formData.addClient, { name: "", email: "", phoneNo: "" }],
    });
  };

  const removeParticipant = (index) => {
    const newParticipants = [...formData.addClient];
    newParticipants.splice(index, 1);
    setFormData({ ...formData, addClient: newParticipants });
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="bg-white w-full max-h-screen overflow-y-auto">
        <div className="max-w-5xl mx-auto pl-52 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {meeting ? "Edit Meeting" : "New Meeting"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XCircle size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Schedule
                </label>
                <input
                  type="datetime-local"
                  value={formData.scheduledTime}
                  onChange={(e) =>
                    setFormData({ ...formData, scheduledTime: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lead</label>
                <select
                  value={formData.forLead}
                  onChange={(e) =>
                    setFormData({ ...formData, forLead: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select Lead</option>
                  {leads.map((lead) => (
                    <option key={lead._id} value={lead._id}>
                      {lead?.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Meeting Link/Address
                </label>
                <input
                  type="text"
                  value={formData.addressAndLink}
                  onChange={(e) =>
                    setFormData({ ...formData, addressAndLink: e.target.value })
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Select Participants
              </label>
              <select
                multiple
                value={formData.participants}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    participants: Array.from(
                      e.target.selectedOptions,
                      (option) => option.value
                    ),
                  })
                }
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
                Hold Ctrl/Cmd to select multiple employees
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Agenda</label>
              <textarea
                value={formData.agenda}
                onChange={(e) =>
                  setFormData({ ...formData, agenda: e.target.value })
                }
                className="w-full border rounded-lg px-3 py-2 text-sm"
                rows={4}
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">
                  External Participants
                </label>
                <button
                  type="button"
                  onClick={addParticipant}
                  className="text-blue-500 text-sm hover:text-blue-600"
                >
                  Add Participant
                </button>
              </div>
              <div className="space-y-2">
                {formData.addClient.map((participant, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={participant.name}
                      onChange={(e) => {
                        const newParticipants = [...formData.addClient];
                        newParticipants[index].name = e.target.value;
                        setFormData({
                          ...formData,
                          addClient: newParticipants,
                        });
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={participant.email}
                      onChange={(e) => {
                        const newParticipants = [...formData.addClient];
                        newParticipants[index].email = e.target.value;
                        setFormData({
                          ...formData,
                          addClient: newParticipants,
                        });
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                      required
                    />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={participant.phoneNo}
                      onChange={(e) => {
                        const newParticipants = [...formData.addClient];
                        newParticipants[index].phoneNo = e.target.value;
                        setFormData({
                          ...formData,
                          addClient: newParticipants,
                        });
                      }}
                      className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeParticipant(index)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <XCircle size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg text-sm disabled:bg-blue-400"
              >
                {isSubmitting
                  ? meeting
                    ? "Updating Meeting..."
                    : "Creating Meeting..."
                  : meeting
                  ? "Update Meeting"
                  : "Create Meeting"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MeetingForm;
