import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaArrowLeft, FaClock, FaCalendarAlt } from "react-icons/fa";
import { addReminder } from "../../services/reminderServices";
import { toast } from "react-toastify";

const ReminderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [reminder, setReminder] = useState({
    type: "Once",
    message: "",
    dateTime: "",
    days: [],
  });

  // useEffect(() => {
  //   if (id) {
  //     fetchReminder();
  //   }
  // }, [id]);

  // const fetchReminder = async () => {
  //   try {
  //     const response = await fetch(`/api/reminders/${id}`);
  //     const data = await response.json();
  //     setReminder(data.reminder);
  //   } catch (error) {
  //     console.error("Error fetching reminder:", error);
  //   }
  // };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReminder((prev) => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setReminder((prev) => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter((d) => d !== day)
        : [...prev.days, day].sort(),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await addReminder(reminder);
      if (response.reminder) {
        toast.success("Reminder saved successfully!");
        navigate("/reminder");
      }
    } catch (error) {
      console.error("Error saving reminder:", error);
      toast.error(error?.response?.data.message || "Failed to save reminder.");
    } finally {
      setLoading(false);
    }
  };

  const renderTypeSpecificFields = () => {
    switch (reminder.type) {
      case "Weekly":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Days
            </label>
            <div className="flex flex-wrap gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day, index) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleDayToggle(index)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${
                      reminder.days.includes(index)
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {day}
                  </button>
                )
              )}
            </div>
          </div>
        );
      case "Once":
      case "Monthly":
      case "Yearly":
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              {reminder.type === "Once" ? "Date & Time" : "Select Date"}
            </label>
            <div className="relative">
              <FaCalendarAlt className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="datetime-local"
                name="dateTime"
                value={reminder.dateTime}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate("/reminder")}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" size={14} />
            <span className="text-sm">Back to Reminders</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {id ? "Edit Reminder" : "New Reminder"}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Type
              </label>
              <div className="flex flex-wrap gap-3">
                {["Once", "Daily", "Weekly", "Monthly", "Yearly"].map(
                  (type) => (
                    <label
                      key={type}
                      className={`flex items-center px-4 py-2 rounded-lg border cursor-pointer transition-colors
                      ${
                        reminder.type === type
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type}
                        checked={reminder.type === type}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <div className="relative">
                <textarea
                  name="message"
                  value={reminder.message}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
                  placeholder="Enter reminder message..."
                />
              </div>
            </div>

            {renderTypeSpecificFields()}

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-colors
                  ${
                    loading
                      ? "bg-blue-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
              >
                {loading ? "Saving..." : "Save Reminder"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReminderForm;
