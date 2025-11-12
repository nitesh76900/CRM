import React, { useState } from "react";
import { format } from "date-fns";
import markAttendanceServices from "../../services/markAttendanceServices";
import { toast } from "react-toastify";
import { useLocationIP } from "./LocationIPContext";

const AttendanceActions = ({
  attendance,
  isAdmin = false,
  canCreate = false,
  onAttendanceUpdate,
  employeeId = null,
  isToday,
}) => {
  const { currentIP, currentLocation } = useLocationIP();
  const [showEditCheckIn, setShowEditCheckIn] = useState(false);
  const [showEditCheckOut, setShowEditCheckOut] = useState(false);
  const [editCheckInTime, setEditCheckInTime] = useState("");
  const [editCheckOutTime, setEditCheckOutTime] = useState("");
  const [showCheckInInput, setShowCheckInInput] = useState(false);
  const [showCheckOutInput, setShowCheckOutInput] = useState(false);
  const [checkInTime, setCheckInTime] = useState("");
  const [checkOutTime, setCheckOutTime] = useState("");
  const [loading, setLoading] = useState(false);

  const isTodayAttendance = () => {
    console.log('attendance', attendance)
    if (!attendance?.date) return false;

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

    const recordDate = new Date(attendance.date)
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

  const handleCheckInClick = async (useManualTime = false) => {
    try {
      setLoading(true);
      const today = new Date();
      const checkIn = useManualTime
        ? new Date(
            `${
              new Date(attendance.date).toISOString().split("T")[0]
            }T${checkInTime}:00`
          )
        : today;

      let response;
      if (isAdmin) {
        response = await markAttendanceServices.markAttendanceByAdmin({
          employeeId: attendance.employeeId?._id || employeeId,
          date: attendance.date,
          checkIn: checkIn.toISOString(),
          isManualEntry: useManualTime,
          status: "Present",
        });
      } else {
        response = await markAttendanceServices.markAttendanceCheckIn({
          employeeId: attendance.employeeId?._id || employeeId,
          location: currentLocation || { lat: 0, long: 0 },
          networkIp: currentIP || "0.0.0.0",
          checkIn: checkIn.toISOString(),
          status: "Present",
        });
      }

      setShowCheckInInput(false);

      if (onAttendanceUpdate) {
        onAttendanceUpdate(response.data?.attendance || response.attendance);
      }
    } catch (error) {
      console.log("error", error);
      toast.error(error.response?.data?.message || "Failed to record check-in");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOutClick = async (useManualTime = false) => {
    try {
      setLoading(true);
      const today = new Date();
      const checkOut = useManualTime
        ? new Date(
            `${
              new Date(attendance.date).toISOString().split("T")[0]
            }T${checkOutTime}:00`
          )
        : today;

      let response;
      if (isAdmin) {
        response = await markAttendanceServices.markAttendanceByAdmin({
          employeeId: attendance.employeeId?._id || employeeId,
          date: attendance.date,
          checkIn: attendance.checkIn,
          checkOut: checkOut.toISOString(),
          isManualEntry: useManualTime,
          status: attendance.status || "Present",
        });
      } else {
        response = await markAttendanceServices.markAttendanceCheckOut({
          attendanceId: attendance._id,
          checkOut: checkOut.toISOString(),
          location: currentLocation || { lat: 0, long: 0 },
          networkIp: currentIP || "0.0.0.0",
        });
      }

      setShowCheckOutInput(false);

      if (onAttendanceUpdate) {
        onAttendanceUpdate(response.data?.attendance || response.attendance);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to record check-out"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditCheckIn = async () => {
    try {
      setLoading(true);
      const checkIn = new Date(
        `${attendance.date.split("T")[0]}T${editCheckInTime}:00`
      );

      const response = await markAttendanceServices.markAttendanceByAdmin({
        employeeId: attendance.employeeId?._id || employeeId,
        date: attendance.date,
        checkIn: checkIn.toISOString(),
        checkOut: attendance.checkOut,
        isManualEntry: true,
        status: attendance.status || "Present",
      });

      toast.success("Check-in time updated successfully");
      setShowEditCheckIn(false);

      if (onAttendanceUpdate) {
        onAttendanceUpdate(response.data?.attendance || response.attendance);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update check-in time"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditCheckOut = async () => {
    try {
      setLoading(true);
      const checkOut = new Date(
        `${attendance.date.split("T")[0]}T${editCheckOutTime}:00`
      );

      const response = await markAttendanceServices.markAttendanceByAdmin({
        employeeId: attendance.employeeId?._id || employeeId,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: checkOut.toISOString(),
        isManualEntry: true,
        status: attendance.status || "Present",
      });

      toast.success("Check-out time updated successfully");
      setShowEditCheckOut(false);

      if (onAttendanceUpdate) {
        onAttendanceUpdate(response.data?.attendance || response.attendance);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to update check-out time"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isAdmin && (!canCreate || !isTodayAttendance())) {
    return null;
  }

  const isCheckedIn = !!attendance?.checkIn;
  const isCheckedOut = !!attendance?.checkOut;

  return (
    <div className="space-y-2">
      {!isCheckedIn ? (
        <div className="flex items-center space-x-2">
          {showCheckInInput ? (
            <>
              <input
                type="time"
                className="border rounded p-1 text-sm"
                value={checkInTime}
                onChange={(e) => setCheckInTime(e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckInClick(true);
                }}
                disabled={loading || !checkInTime}
                className="bg-green-500 p-1 rounded text-white disabled:bg-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckInInput(false);
                }}
                className="bg-red-500 p-1 rounded text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckInClick(false);
                }}
                disabled={loading || !isToday}
                className={`bg-blue-500 text-white text-xs px-2 py-1 rounded transition ${
                  !isToday ? "opacity-50 cursor-not-allowed " : ""
                }`}
              >
                Check In Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckInInput(true);
                }}
                className="text-blue-500 text-xs"
              >
                Manual
              </button>
            </div>
          )}
        </div>
      ) : !isCheckedOut ? (
        <div className="flex items-center space-x-2">
          {showCheckOutInput ? (
            <>
              <input
                type="time"
                className="border rounded p-1 text-sm"
                value={checkOutTime}
                onChange={(e) => setCheckOutTime(e.target.value)}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckOutClick(true);
                }}
                disabled={loading || !checkOutTime}
                className="bg-green-500 p-1 rounded text-white disabled:bg-gray-300"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckOutInput(false);
                }}
                className="bg-red-500 p-1 rounded text-white"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCheckOutClick(false);
                }}
                disabled={loading || !isToday}
                className={`bg-purple-500 text-white text-xs px-2 py-1 rounded transition ${
                  !isToday ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Check Out Now
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCheckOutInput(true);
                }}
                className="text-purple-500 text-xs"
              >
                Manual
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-xs text-gray-500">
          Completed: {format(new Date(attendance.checkIn), "hh:mm a")} -{" "}
          {format(new Date(attendance.checkOut), "hh:mm a")}
        </div>
      )}

      {isCheckedIn && isCheckedOut && (
        <div className="flex flex-col space-y-1">
          {isAdmin && (
            <div className="flex items-center space-x-2">
              {showEditCheckIn ? (
                <>
                  <input
                    type="time"
                    className="border rounded p-1 text-sm"
                    value={editCheckInTime}
                    onChange={(e) => setEditCheckInTime(e.target.value)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCheckIn();
                    }}
                    disabled={loading || !editCheckInTime}
                    className="bg-green-500 p-1 rounded text-white disabled:bg-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditCheckIn(false);
                    }}
                    className="bg-red-500 p-1 rounded text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              ) : showEditCheckOut ? (
                <>
                  <input
                    type="time"
                    className="border rounded p-1 text-sm"
                    value={editCheckOutTime}
                    onChange={(e) => setEditCheckOutTime(e.target.value)}
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditCheckOut();
                    }}
                    disabled={loading || !editCheckOutTime}
                    className="bg-green-500 p-1 rounded text-white disabled:bg-gray-300"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowEditCheckOut(false);
                    }}
                    className="bg-red-500 p-1 rounded text-white"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCheckInTime(
                        format(new Date(attendance.checkIn), "HH:mm")
                      );
                      setShowEditCheckIn(true);
                      setShowEditCheckOut(false);
                    }}
                    className="bg-blue-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Edit Check-In
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditCheckOutTime(
                        format(new Date(attendance.checkOut), "HH:mm")
                      );
                      setShowEditCheckOut(true);
                      setShowEditCheckIn(false);
                    }}
                    className="bg-purple-500 text-white text-xs px-2 py-1 rounded"
                  >
                    Edit Check-Out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AttendanceActions;
