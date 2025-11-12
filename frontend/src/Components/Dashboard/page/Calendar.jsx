import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { red, blue, green, purple, orange } from "@mui/material/colors";
import { getCalendarData } from "../../../services/dashboardServices";
import { toast, ToastContainer } from "react-toastify";

const localizer = momentLocalizer(moment);
const label = { inputProps: { "aria-label": "Checkbox demo" } };

// Event type colors
const eventColors = {
  meeting: "#3B82F6",
  lead: "#10B981",
  task: "#EF4444",
  todo: "#9333EA",
  reminder: "#F59E0B",
};

const MyCalendar = () => {
  const [selectedFilters, setSelectedFilters] = useState([
    "meeting",
    "lead",
    "task",
    "todo",
    "reminder",
  ]);
  const [events, setEvents] = useState([]);

  // Function to transform API data into calendar events
  const transformData = (data) => {
    let transformedEvents = [];

    // Transform meetings
    if (data?.meetings) {
      transformedEvents.push(
        ...data?.meetings.map((meeting) => ({
          id: meeting?._id,
          title: meeting?.title,
          start: new Date(meeting?.scheduledTime),
          end: new Date(moment(meeting?.scheduledTime).add(1, "hour")),
          type: "meeting",
        }))
      );
    }

    // Transform leads with followUps
    if (data?.leads) {
      data.leads.forEach((lead) => {
        lead.followUps.forEach((followUp) => {
          transformedEvents.push({
            id: `${lead._id}-${followUp.sequence}`,
            title: `Lead: ${lead.title}`,
            start: new Date(followUp.date),
            end: new Date(moment(followUp.date).add(1, "hour")),
            type: "lead",
          });
        });
      });
    }

    // Transform tasks
    if (data?.tasks) {
      transformedEvents.push(
        ...data.tasks.map((task) => ({
          id: task._id,
          title: `Task: ${task.title}`,
          start: new Date(task.dueDate),
          end: new Date(moment(task.dueDate).add(1, "hour")),
          type: "task",
        }))
      );
    }

    // Transform todos
    if (data?.todos) {
      transformedEvents.push(
        ...data.todos.map((todo) => ({
          id: todo._id,
          title: `Todo: ${todo.title}`,
          start: new Date(todo.dueDate),
          end: new Date(moment(todo.dueDate).add(1, "hour")),
          type: "todo",
        }))
      );
    }

    // Transform reminders
    if (data?.reminders) {
      transformedEvents.push(
        ...data.reminders.map((reminder) => ({
          id: reminder._id,
          title: `Reminder: ${reminder.message}`,
          start: new Date(reminder.dateTime),
          end: new Date(moment(reminder.dateTime).add(1, "hour")),
          type: "reminder",
        }))
      );
    }

    return transformedEvents;
  };

  // Fetch calendar data
  const fetchCalendarData = async (start, end) => {
    try {
      console.log("start", start);
      console.log("end", end);
      const response = await getCalendarData(
        moment(start).format("YYYY-MM-DD"),
        moment(end).format("YYYY-MM-DD")
      );
      // console.log("response", response);
      const transformedEvents = transformData(response.data);
      console.log("transformedEvents", transformedEvents);
      setEvents(transformedEvents);
    } catch (error) {
      toast.error(error?.response?.data.message || "Error fetching calendar data:");
    }
  };

  // Handle range change
  const handleRangeChange = (range) => {
    const [start, end] = Array.isArray(range)
      ? range
      : [range.start, range.end];
    fetchCalendarData(start, end);
  };

  useEffect(() => {
    // Initial fetch for current month
    const start = moment().startOf("month").toDate();
    const end = moment().endOf("month").toDate();
    fetchCalendarData(start, end);
  }, []);

  const toggleFilter = (filter) => {
    setSelectedFilters((prev) =>
      prev.includes(filter)
        ? prev.filter((item) => item !== filter)
        : [...prev, filter]
    );
  };

  const filteredEvents = events.filter((event) =>
    selectedFilters.includes(event.type)
  );

  const eventStyleGetter = (event) => {
    const backgroundColor = eventColors[event.type] || "#6B7280";
    return {
      style: {
        backgroundColor,
        color: "white",
        borderRadius: "5px",
        padding: "0px px",
      },
    };
  };

  return (
    <div className="h-[70vh] my-10">
      <ToastContainer position="top-center" autoClose={3000} style={{marginTop:"50px"}}/>
      <div className="flex">
        <div className="w-1/8 bg-gray-200 p-5 mb-4 flex flex-col">
          <h2 className="text-xl font-bold mb-4">Filters</h2>
          <FormControlLabel
            label="Meetings"
            control={
              <Checkbox
                {...label}
                defaultChecked
                onChange={() => toggleFilter("meeting")}
                checked={selectedFilters.includes("meeting")}
                sx={{
                  color: blue[800],
                  "&.Mui-checked": {
                    color: blue[600],
                  },
                }}
              />
            }
          />
          <FormControlLabel
            label="Leads"
            control={
              <Checkbox
                {...label}
                defaultChecked
                onChange={() => toggleFilter("lead")}
                checked={selectedFilters.includes("lead")}
                sx={{
                  color: green[800],
                  "&.Mui-checked": {
                    color: green[600],
                  },
                }}
              />
            }
          />
          <FormControlLabel
            label="Tasks"
            control={
              <Checkbox
                {...label}
                defaultChecked
                onChange={() => toggleFilter("task")}
                checked={selectedFilters.includes("task")}
                sx={{
                  color: red[800],
                  "&.Mui-checked": {
                    color: red[600],
                  },
                }}
              />
            }
          />
          <FormControlLabel
            label="Todos"
            control={
              <Checkbox
                {...label}
                defaultChecked
                onChange={() => toggleFilter("todo")}
                checked={selectedFilters.includes("todo")}
                sx={{
                  color: purple[800],
                  "&.Mui-checked": {
                    color: purple[600],
                  },
                }}
              />
            }
          />
          <FormControlLabel
            label="Reminders"
            control={
              <Checkbox
                {...label}
                defaultChecked
                onChange={() => toggleFilter("reminder")}
                checked={selectedFilters.includes("reminder")}
                sx={{
                  color: orange[800],
                  "&.Mui-checked": {
                    color: orange[600],
                  },
                }}
              />
            }
          />
        </div>

        <div className="w-7/8 p-5">
          <h2 className="text-2xl font-bold text-center mb-4">
            Event Calendar
          </h2>
          <Calendar
            localizer={localizer}
            events={filteredEvents}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 500 }}
            views={["month", "week", "day", "agenda"]}
            defaultView="month"
            className="rounded-lg shadow-md"
            eventPropGetter={eventStyleGetter}
            onRangeChange={handleRangeChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MyCalendar;
