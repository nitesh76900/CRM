import React, { useState, useEffect } from "react";
import { Plus, Edit2, XCircle, Check, Send } from "lucide-react";
import meetingServices from "../../services/meetingServices";
import MeetingForm from "./MeetingForm";
import { ToastContainer, toast } from "react-toastify";
import { FaBell, FaSave } from "react-icons/fa";
import { addStickyNote } from "../../services/stickyNotesServices";
import { Tooltip } from "react-tooltip";
import authServices from "../../services/authServices";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const Meetings = () => {
  const [filters, setFilters] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0], // First day of the current month
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
      .toISOString()
      .split("T")[0], // Last day of the current month
  });
  

  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [showConclusionModal, setShowConclusionModal] = useState(false);
  const [conclusion, setConclusion] = useState("");
  const [statusToChange, setStatusToChange] = useState(null);
  const [disabledButtons, setDisabledButtons] = useState({});
  const [role, setRole] = useState("");
  const [meetingPermissions, setMeetingPermissions] = useState(null);

  const user = useSelector(selectUser);

  const fetchProfile = async () => {
    if (user && user.company) {
      setRole("Employee");
      console.log("response.user.role.permissions", user.role.permissions);
      setMeetingPermissions(user.role.permissions.meeting);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  };

  useEffect(() => {
    fetchProfile();
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchMeetings(); // Initial fetch
  }, []); // Remove filters dependency here to avoid auto-fetch on every change

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const response = await meetingServices.getMeetings({
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      console.log("response.meetings", response.meetings);
      if (!response.meetings || response.meetings.length === 0) {
        setMeetings([]);
        toast.warn("No meetings found for the selected date range");
      } else {
        setMeetings(response.meetings);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message || "Error fetching meetings");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (meetingId, status) => {
    setStatusToChange(status);
    setSelectedMeeting(meetings.find((m) => m._id === meetingId));
    setShowConclusionModal(true);
  };

  const handleConclusionSubmit = async () => {
    try {
      const meetingId = selectedMeeting._id;
      setDisabledButtons((prev) => ({ ...prev, [meetingId]: true }));

      await meetingServices.changeMeetingStatus(meetingId, {
        status: statusToChange,
        conclusion: conclusion,
      });

      setShowConclusionModal(false);
      setConclusion("");
      setStatusToChange(null);
      setSelectedMeeting(null);

      await fetchMeetings();

      setTimeout(() => {
        setDisabledButtons((prev) => ({ ...prev, [meetingId]: false }));
      }, 3000);
    } catch (error) {
      toast.error(error || "Error changing status:");
    }
  };

  const handleSendReminder = async (meetingId) => {
    try {
      setDisabledButtons((prev) => ({ ...prev, [meetingId]: true }));
      await meetingServices.sendMeetingReminder(meetingId);
      toast.success("Reminder sent successfully");
      setTimeout(() => {
        setDisabledButtons((prev) => ({ ...prev, [meetingId]: false }));
      }, 3000);
    } catch (error) {
      toast.error(error || "Error sending reminder:");
    }
  };

  const handleAddNote = async (meeting) => {
    try {
      const formattedTime = formatDate(meeting.scheduledTime);
      const noteMessage = `${meeting.title} - ${formattedTime}`;

      await addStickyNote({
        type: "meeting",
        message: noteMessage,
        url: window.location.pathname,
      });

      toast.success("Added to Notes");
    } catch (error) {
      toast.error("Error adding note: " + error.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "Cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (new Date(filters.endDate) < new Date(filters.startDate)) {
    toast.error("End date cannot be before start date");
    return;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Meetings</h1>

        <button
          onClick={() => {
            setSelectedMeeting(null);
            setShowForm(true);
          }}
          disabled={!(role === "CompanyAdmin" || meetingPermissions?.create)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm 
    ${
      role === "CompanyAdmin" || meetingPermissions?.create
        ? "bg-blue-500 text-white cursor-pointer"
        : "bg-gray-400 text-gray-200 cursor-not-allowed"
    }`}
        >
          <Plus size={16} /> New Meeting
        </button>
      </div>

      <div className="w-full mb-6 flex gap-4 mx-auto">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, startDate: e.target.value }));
              fetchMeetings();
            }}
            className="w-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => {
              setFilters((prev) => ({ ...prev, endDate: e.target.value }));
              fetchMeetings();
            }}
            className="w-100 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <td colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </td>
        ) : (
          <table className="min-w-full bg-white rounded-lg">
            <thead>
              <tr className="pl-5 bg-gray-300">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  External Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-400">
              {meetings.length > 0 ? (
                meetings.map((meeting) => (
                  <tr
                    key={meeting._id}
                    className="group hover:bg-gray-100 relative"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      {meeting.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(meeting.scheduledTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {meeting.forLead?.title || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(
                          meeting.meetingStatus
                        )}`}
                      >
                        {meeting.meetingStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs overflow-hidden">
                        {meeting.participants.map((participant) => (
                          <div
                            key={participant._id}
                            className="text-sm truncate"
                          >
                            {participant?.name}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs overflow-hidden">
                        {meeting.addParticipants?.map((participant) => (
                          <div
                            key={participant._id}
                            className="text-sm truncate"
                          >
                            {participant?.name} ({participant?.email})
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          data-tooltip-id="edit-tooltip"
                          data-tooltip-content="Edit Meeting"
                          onClick={() => {
                            setSelectedMeeting(meeting);
                            setShowForm(true);
                          }}
                          className={` disabled:opacity-50 ${
                            role === "CompanyAdmin" ||
                            meetingPermissions?.create
                              ? "text-blue-500 hover:text-blue-700 cursor-pointer"
                              : " text-gray-500 cursor-not-allowed"
                          }`}
                          disabled={
                            !(
                              role === "CompanyAdmin" ||
                              meetingPermissions?.create
                            )
                          }
                        >
                          <Edit2 size={16} />
                        </button>
                        <Tooltip id="edit-tooltip" />

                        {meeting.meetingStatus === "Pending" && (
                          <>
                            <button
                              data-tooltip-id="complete-tooltip"
                              data-tooltip-content="Mark as Complete"
                              onClick={() =>
                                handleStatusChange(meeting._id, "Complete")
                              }
                              className={` disabled:opacity-50${
                                role === "CompanyAdmin" ||
                                meetingPermissions?.create
                                  ? "text-green-500 hover:text-green-700 cursor-pointer"
                                  : "bg-gray-400 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={
                                !(
                                  role === "CompanyAdmin" ||
                                  meetingPermissions?.create
                                )
                              }
                            >
                              <Check size={16} />
                            </button>
                            <Tooltip id="complete-tooltip" />

                            <button
                              data-tooltip-id="cancel-tooltip"
                              data-tooltip-content="Cancel Meeting"
                              onClick={() =>
                                handleStatusChange(meeting._id, "Cancel")
                              }
                              className={` disabled:opacity-50${
                                role === "CompanyAdmin" ||
                                meetingPermissions?.create
                                  ? "text-red-500 hover:text-red-700 cursor-pointer"
                                  : "bg-gray-400 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={
                                !(
                                  role === "CompanyAdmin" ||
                                  meetingPermissions?.create
                                )
                              }
                            >
                              <XCircle size={16} />
                            </button>
                            <Tooltip id="cancel-tooltip" />

                            <button
                              data-tooltip-id="reminder-tooltip"
                              data-tooltip-content="Send Reminder"
                              onClick={() => handleSendReminder(meeting._id)}
                              className={` disabled:opacity-50${
                                role === "CompanyAdmin" ||
                                meetingPermissions?.create
                                  ? "text-orange-500 hover:text-orange-700 cursor-pointer"
                                  : "bg-gray-400 text-gray-500 cursor-not-allowed"
                              }`}
                              disabled={
                                !(
                                  role === "CompanyAdmin" ||
                                  meetingPermissions?.create
                                )
                              }
                            >
                              <Send size={16} />
                            </button>
                            <Tooltip id="reminder-tooltip" />

                            <button
                              data-tooltip-id="note-tooltip"
                              data-tooltip-content="Add Note"
                              onClick={() => handleAddNote(meeting)}
                              className="text-yellow-500 p-2 rounded-md mr-4"
                            >
                              <FaSave size={20} />
                            </button>
                            <Tooltip id="note-tooltip" />
                          </>
                        )}
                      </div>
                    </td>

                    {/* Conclusion column, only shown on hover */}
                    {meeting.conclusion && (
                      <div className=" min-w-[150px] absolute right-[50%] top-[-50%] px-2 bg-gray-200 rounded-xl shadow-lg hidden group-hover:block">
                        <p className=" font-bold text-gray-800">conclusion:</p>
                        {meeting.conclusion}
                      </div>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-500">
                    No Meetings Available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <MeetingForm
          meeting={selectedMeeting}
          onClose={() => {
            setShowForm(false);
            setSelectedMeeting(null);
          }}
          onSuccess={() => {
            fetchMeetings();
            setShowForm(false);
            setSelectedMeeting(null);
          }}
        />
      )}

      <Modal
        isOpen={showConclusionModal}
        onClose={() => {
          setShowConclusionModal(false);
          setConclusion("");
        }}
        title={
          statusToChange === "Complete" ? "Complete Meeting" : "Cancel Meeting"
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Conclusion (Optional)
            </label>
            <input
              type="text"
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              placeholder="Enter meeting conclusion..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                setShowConclusionModal(false);
                setConclusion("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleConclusionSubmit}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              {statusToChange === "Complete" ? "Complete" : "Cancel Meeting"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Meetings;
