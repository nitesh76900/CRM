import React, { useState } from "react";
import { format } from "date-fns";
import AttendanceActions from "./AttendanceActions";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { BsCalendar2Check } from "react-icons/bs";

const StatusBadge = ({ status, holidayName }) => {
  let bgColor;
  let textColor = "text-white";

  switch (status) {
    case "Present":
      bgColor = "bg-green-500";
      break;
    case "Absent":
      bgColor = "bg-red-500";
      break;
    case "Half-Day":
      bgColor = "bg-yellow-500";
      break;
    case "Leave":
      bgColor = "bg-purple-500";
      break;
    case "Remote":
      bgColor = "bg-blue-500";
      break;
    case "Holiday":
      bgColor = "bg-pink-500";
      break;
    default:
      bgColor = "bg-gray-500";
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status}
      {holidayName && <span className="ml-1">({holidayName})</span>}
    </span>
  );
};

const AttendanceTable = ({
  attendances,
  onStatusChange,
  onAttendanceUpdate,
  userRole,
  permissions = [],
}) => {
  const navigate = useNavigate();
  if (!attendances || attendances.length === 0) {
    return (
      <div className="text-center p-6 text-gray-500">
        No attendance records found
      </div>
    );
  }

  const canCreateAttendance = permissions.attendance?.create === true;
  const isAdmin = userRole === "CompanyAdmin";

  const isTodayDate = (dateString) => {
    const today = new Date()
      .toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");
    const recordDate = new Date(dateString)
      .toLocaleDateString("en-GB", {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      .split("/")
      .reverse()
      .join("-");
    return today === recordDate;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white rounded-lg overflow-hidden shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Employee
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check In
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Check Out
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Work Hours
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Attendance
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {[...attendances] // Create a shallow copy to avoid mutating the original array
            .sort((a, b) => {
              const nameA = a?.employeeId?.user?.name || "Unknown Employee";
              const nameB = b?.employeeId?.user?.name || "Unknown Employee";
              return nameA.localeCompare(nameB); // Sort alphabetically
            })
            .map((attendance) => {
              const isToday = isTodayDate(attendance.date);
              const [selectedStatus, setSelectedStatus] = useState(
                attendance.status
              ); // Track selected status
              const [selectedLeaveType, setSelectedLeaveType] = useState(
                attendance.leaveType || ""
              ); // Track leave type

              const handleStatusChange = (attendanceId, status, leaveType) => {
                if (status === "Leave" && !leaveType) {
                  toast.warn("Please select a leave type for Leave status.");
                  return;
                }
                onStatusChange(attendanceId, status, leaveType);
              };

              return (
                <tr key={attendance._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="relative group">
                        <BsCalendar2Check
                          size={24}
                          className="cursor-pointer"
                          onClick={() =>
                            navigate(
                              `/employee-attendance/${attendance?.employeeId._id}`
                            )
                          }
                        />
                        {/* Tooltip */}
                        <span className="absolute ml-10 left-1/2 transform -translate-x-1/2 -top-8 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                          View Attendance Record
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {attendance?.employeeId?.user?.name ||
                            "Unknown Employee"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {attendance?.employeeId?.designation || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(attendance.date), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkIn
                      ? format(new Date(attendance.checkIn), "hh:mm a")
                      : "---"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.checkOut
                      ? format(new Date(attendance.checkOut), "hh:mm a")
                      : "---"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {attendance.workHours
                      ? `${attendance.workHours.toFixed(2)} hrs`
                      : "---"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge
                      status={attendance.status}
                      holidayName={attendance.holidayName}
                    />
                  </td>
                  <td className="px-4 whitespace-nowrap text-sm font-medium">
                    {attendance.status !== "Holiday" &&
                      (isAdmin ||
                        (canCreateAttendance &&
                          isToday &&
                          attendance.status === "Pending")) && (
                        <div
                          className="flex flex-col space-y-2 border-1 border-gray-300 rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <select
                            className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            value={selectedStatus}
                            onChange={(e) => {
                              const newStatus = e.target.value;
                              setSelectedStatus(newStatus);
                              if (newStatus !== "Leave") {
                                handleStatusChange(
                                  attendance._id,
                                  newStatus,
                                  ""
                                );
                                setSelectedLeaveType("");
                              }
                            }}
                            disabled={attendance.status === "Holiday"}
                          >
                            {/* <option value="Pending">Pending</option> */}
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                            <option value="Half-Day">Half-Day</option>
                            <option value="Leave">Leave</option>
                            <option value="Remote">Remote</option>
                          </select>
                          {selectedStatus === "Leave" && (
                            <select
                              className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                              value={selectedLeaveType}
                              onChange={(e) => {
                                setSelectedLeaveType(e.target.value);
                                handleStatusChange(
                                  attendance._id,
                                  "Leave",
                                  e.target.value
                                );
                              }}
                            >
                              <option value="">Select Leave Type</option>
                              <option value="Sick Leave">Sick Leave</option>
                              <option value="Casual Leave">Casual Leave</option>
                              <option value="Annual Leave">Annual Leave</option>
                              <option value="Unpaid Leave">Unpaid Leave</option>
                            </select>
                          )}
                        </div>
                      )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <AttendanceActions
                      attendance={attendance}
                      isAdmin={isAdmin}
                      canCreate={canCreateAttendance}
                      onAttendanceUpdate={onAttendanceUpdate}
                      employeeId={attendance.employeeId?._id}
                      isToday={isToday}
                    />
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

const DatePicker = ({ label, selectedDate, onChange, maxDate }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <input
        type="date"
        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        value={selectedDate}
        onChange={(e) => onChange(e.target.value)}
        max={maxDate || undefined}
      />
    </div>
  );
};

const AttendanceSummary = ({ attendances }) => {
  if (!attendances || attendances.length === 0) {
    return null;
  }

  const total = attendances.length;
  const present = attendances.filter((a) => a.status === "Present").length;
  const absent = attendances.filter((a) => a.status === "Absent").length;
  const leave = attendances.filter((a) => a.status === "Leave").length;
  const halfDay = attendances.filter((a) => a.status === "Half-Day").length;
  const remote = attendances.filter((a) => a.status === "Remote").length;
  const pending = attendances.filter((a) => a.status === "Pending").length;
  const holiday = attendances.filter((a) => a.status === "Holiday").length;

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Attendance Summary
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <p className="text-sm text-green-800">Present</p>
          <p className="text-2xl font-bold text-green-800">{present}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <p className="text-sm text-red-800">Absent</p>
          <p className="text-2xl font-bold text-red-800">{absent}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">Half-Day</p>
          <p className="text-2xl font-bold text-yellow-800">{halfDay}</p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <p className="text-sm text-purple-800">Leave</p>
          <p className="text-2xl font-bold text-purple-800">{leave}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <p className="text-sm text-blue-800">Remote</p>
          <p className="text-2xl font-bold text-blue-800">{remote}</p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="text-sm text-gray-800">Pending</p>
          <p className="text-2xl font-bold text-gray-800">{pending}</p>
        </div>
        <div className="bg-pink-100 p-4 rounded-lg">
          <p className="text-sm text-pink-800">Holiday</p>
          <p className="text-2xl font-bold text-pink-800">{holiday}</p>
        </div>
        <div className="bg-indigo-100 p-4 rounded-lg">
          <p className="text-sm text-indigo-800">Total</p>
          <p className="text-2xl font-bold text-indigo-800">{total}</p>
        </div>
      </div>
    </div>
  );
};

export { AttendanceTable, StatusBadge, DatePicker, AttendanceSummary };
