import React, { useState, useEffect } from "react";

const EventSection = ({ meetings, reminders }) => {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Combine meetings and reminders into events array
  const events = [
    ...(meetings || []).map((meeting) => ({
      id: meeting._id,
      title: meeting.title,
      date: new Date(meeting.scheduledTime).toLocaleDateString(),
      type: "meeting",
    })),
    ...(reminders || []).map((reminder) => ({
      id: reminder._id,
      title: reminder.message,
      date: reminder.dateTime
        ? new Date(reminder.dateTime).toLocaleDateString()
        : "Daily",
      type: "reminder",
    })),
  ];

  // Filter events based on the selected filter
  const filteredEvents =
    filter === "all" ? events : events.filter((event) => event.type === filter);

    useEffect(() => {
            const timer = setTimeout(() => {
              setLoading(false);
            }, 2000);
        
            return () => clearTimeout(timer);
          }, []);

  return (
    <div className="w-[400px] h-[350px] overflow-y-auto px-6 py-2 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Events</h2>

      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("meeting")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "meeting"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Meetings
        </button>
        <button
          onClick={() => setFilter("reminder")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "reminder"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Reminders
        </button>
      </div>
      {loading ? (<div className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>):filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No Events Available
            </div>
          ):
      <ul className="space-y-3">
        {filteredEvents.map((event) => (
          <li
            key={event.id}
            className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="text-gray-700 font-medium">{event.title}</p>
              <p className="text-sm text-gray-500">{event.date}</p>
            </div>
            <span
              className={`inline-block px-3 py-1 mt-2 rounded-full text-xs font-semibold ${
                event.type === "meeting"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {event.type}
            </span>
          </li>
        ))}
      </ul>}
    </div>
  );
};

export default EventSection;
