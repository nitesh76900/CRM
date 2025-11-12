import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaCalendarAlt, FaTrash, FaSave } from "react-icons/fa";
import { DateRangePicker } from "react-date-range";
import { addDays, format } from "date-fns";
import { getRemindersByDateRange, deleteReminder } from "../../services/reminderServices";
import { addStickyNote } from "../../services/stickyNotesServices";
import { ToastContainer, toast } from "react-toastify";
import "react-date-range/dist/styles.css"; 
import "react-date-range/dist/theme/default.css"; 

const ReminderList = () => {
  const navigate = useNavigate();
  const [reminders, setReminders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [clicked, setClicked] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true)
  const datePickerRef = useRef(null);


  // Date range state
  const [dateRange, setDateRange] = useState({
    selection: {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  });


  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    if (showDatePicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDatePicker]);

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const { startDate, endDate } = dateRange.selection;
        const response = await getRemindersByDateRange(
          startDate.toISOString().split("T")[0],
          endDate.toISOString().split("T")[0]
        );
        setReminders(response.reminders || []);
      } catch (error) {
        console.error("Error fetching reminders:", error);
        toast.error(error?.response?.data.message ||"Error fetching reminders: ");
      } finally{
        setLoading(false)
      }
    };

    fetchReminders();
  }, [dateRange]);

  const handleDelete = async (id) => {
    try {
      await deleteReminder(id);
      toast.success("Reminder deleted successfully!");
      setReminders((prev) => prev.filter((reminder) => reminder._id !== id));
    } catch (error) {
      toast.error(error?.response?.data.message || "Failed to delete reminder: " );
    }
  };

  const handleAddStickyNote = async (reminder) => {
    try {
      const formattedDateTime = formatDateTime(reminder.dateTime);
      const noteMessage = `${reminder.message} - ${formattedDateTime}`;

      await addStickyNote({
        type: "reminder",
        message: noteMessage,
        url: window.location.pathname,
      });

      toast.success("Added to notes");
    } catch (error) {
      toast.error("Error adding sticky note: " + error.message);
    }
  };

  const filteredReminders = reminders.filter((reminder) =>
    reminder.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDateTime = (dateTime) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateTime));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <ToastContainer position="top-center" autoClose={3000} />

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Reminders</h2>
        <button
          onClick={() => navigate("/reminderForm")}
          className="bg-blue-500 text-white px-4 py-2 text-sm rounded-lg hover:bg-blue-600"
        >
          + New Reminder
        </button>
      </div>

      {/* Search & Date Picker */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-6">
        <div className="relative flex-1 flex items-center mt-5 ">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search reminders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:border-blue-500"
          />
        </div>

        {/* Vertical Infinite Date Range Picker */}
      {/* Input Field for Date Range */}
      <div className="relative ">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Select Date Range
      </label>
        <input
          type="text"
          readOnly
          value={`${format(dateRange.selection.startDate, "dd MMM yyyy")} - ${format(dateRange.selection.endDate, "dd MMM yyyy")}`}
          onClick={() => setShowDatePicker(!showDatePicker)}
          className="w-full border border-gray-300 p-2 rounded-lg text-center cursor-pointer text-[15px]"
        />

        {/* Date Picker Modal */}
        {showDatePicker && (
          <div ref={datePickerRef} className="absolute top-full right-0 z-50 bg-white shadow-lg rounded-lg mt-2">
            <DateRangePicker
              onChange={(item) => setDateRange({ ...dateRange, ...item })}
              months={1}
              minDate={addDays(new Date(), -300)}
              maxDate={addDays(new Date(), 900)}
              direction="vertical"
              scroll={{ enabled: true }}
              ranges={[dateRange.selection]}
            />
          </div>
        )}
      </div>
    </div>

      {/* Reminder Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {loading ? (
          <td colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </td> ):(
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase">
              <th className="px-4 py-3 text-left">Message</th>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Schedule</th>
              <th className="px-4 py-3 text-center w-24">Actions</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-gray-100">
            {filteredReminders.length > 0 ? (
              filteredReminders.map((reminder) => (
                <tr key={reminder._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900 truncate max-w-md">
                    {reminder.message}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {reminder.generated ? `${reminder.type} (Generated)` : reminder.type}
                  </td>
                  <td className="px-4 py-3 items-center">
                    {/* <FaCalendarAlt className="text-gray-400 mr-2" size={12} /> */}
                    <span className="text-xs text-gray-600">
                      {formatDateTime(reminder.dateTime)}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex justify-center gap-3">
                    <button
                      onClick={() => handleDelete(reminder._id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <FaTrash size={14} />
                    </button>
                    <button
                      onClick={() => {
                        setClicked(true);
                        handleAddStickyNote(reminder);
                        setTimeout(() => setClicked(false), 200);
                      }}
                      className="text-yellow-500 hover:text-red-700 transition-transform duration-200"
                    >
                      <FaSave className={clicked ? "scale-125" : "scale-100"} size={20} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-8 text-gray-500">
                  No Reminders Available
                </td>
              </tr>
            )}
          </tbody>
        </table>)}
      </div>
    </div>
  );
};

export default ReminderList;
