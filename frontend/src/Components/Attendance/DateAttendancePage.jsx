import React, { useState, useEffect } from "react";
import markAttendanceServices from "../../services/markAttendanceServices";
import { toast, ToastContainer } from "react-toastify";
import { format } from "date-fns";
import { AttendanceSummary, DatePicker } from "./AttendanceComponents";
import { AttendanceTable } from "./AttendanceComponents";
import { selectUser } from "../../store/slices/userSlice";
import { useSelector } from "react-redux";
import AttendanceSetting from "./AttendanceSetting";
import AttendanceChecker from "./AttendanceChecker";
import { useLocationIP } from "./LocationIPContext";
import { TbReportAnalytics } from "react-icons/tb";
import { useNavigate } from "react-router";

const DateAttendancePage = () => {
  const navigate = useNavigate();
  const { currentIP, currentLocation } = useLocationIP();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const user = useSelector(selectUser);
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState([]);

  console.log(currentIP, currentLocation);

  useEffect(() => {
    if (user && user.company) {
      setRole("Employee");
      // console.log("user.role", user.role);
      setPermissions(user.role?.permissions || []);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
    fetchTodayAttendance();
  }, [user]);

  const fetchTodayAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await markAttendanceServices.getTodayAttendances();

      if (result.success) {
        setAttendances(result.attendances || []);
        setIsHoliday(result.isHoliday || false);
        if (result.message && result.message.includes("It is a holiday")) {
          setHolidayName(result.message.split(": ")[1]);
        } else {
          setHolidayName("");
        }
      } else {
        setError(result.message || "Failed to fetch attendance data");
        setAttendances([]);
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching attendance data"
      );
      toast.error(
        err?.response?.data.message || "Failed to fetch attendance data"
      );
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceByDate = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const result = await markAttendanceServices.getAttendanceByDate(date);

      if (result.success) {
        setAttendances(result.attendances || []);
        setIsHoliday(result.isHoliday || false);

        if (result.message && result.message.includes("It is a holiday")) {
          setHolidayName(result.message.split(": ")[1]);
        } else {
          setHolidayName("");
        }
      } else {
        setError(result.message || "Failed to fetch attendance data");
        setAttendances([]);
      }
    } catch (err) {
      setError(
        err.message || "An error occurred while fetching attendance data"
      );
      toast.error(
        err?.response?.data.message || "Failed to fetch attendance data"
      );
      setAttendances([]);
    } finally {
      setLoading(false);
    }
  };

  const ondateChange = (date) => {
    setSelectedDate(date);
    fetchAttendanceByDate(date);
  };

  const handleStatusChange = async (attendanceId, newStatus, leaveType) => {
    try {
      const attendance = attendances.find((a) => a._id === attendanceId);
      if (!attendance) return;

      if (role === "CompanyAdmin") {
        await markAttendanceServices.markAttendanceByAdmin({
          employeeId: attendance.employeeId._id,
          date: attendance.date,
          checkIn: attendance.checkIn,
          checkOut: attendance.checkOut,
          isManualEntry: true,
          status: newStatus,
          leaveType,
        });
      } else {
        await markAttendanceServices.markAttendanceCheckIn({
          employeeId: attendance.employeeId._id,
          location: currentLocation || { lat: 0, long: 0 },
          networkIp: currentIP || "0.0.0.0",
          checkIn: attendance.checkIn || new Date().toISOString(),
          status: newStatus,
          leaveType,
        });
      }

      setAttendances((prevAttendances) =>
        prevAttendances.map((att) =>
          att._id === attendanceId ? { ...att, status: newStatus } : att
        )
      );
      fetchAttendanceByDate(attendance.date);
      toast.success("Attendance status updated successfully");
    } catch (err) {
      console.log("err", err);
      toast.error(
        err?.response?.data.message || "Failed to update attendance status"
      );
    }
  };

  const handleAttendanceUpdate = (updatedAttendance) => {
    setAttendances((prevAttendances) =>
      prevAttendances.map((att) =>
        att._id === updatedAttendance._id
          ? {
              ...att,
              ...updatedAttendance,
              // Preserve employee data that might be missing in the update
              employeeId: {
                ...att.employeeId,
                ...updatedAttendance.employeeId,
              },
            }
          : att
      )
    );
  };

  // Determine if user should see data
  const canViewAttendance =
    role === "CompanyAdmin" || permissions.attendance?.read;

  // Check if we should show today's data only (for employees)
  const isTodaySelected = selectedDate === format(new Date(), "yyyy-MM-dd");
  const shouldShowData =
    role === "CompanyAdmin" ||
    (permissions.attendance?.read &&
      (isTodaySelected || permissions.attendance?.read));

  // Check if user can modify attendance settings
  const canModifyAttendanceSettings =
    role === "CompanyAdmin" || permissions.attendance?.read;

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Employee Attendance
        </h1>
        <TbReportAnalytics
          onClick={() => navigate("/attendance/analysis")}
          className="text-5xl mb-5 mr-3 text-gray-800"
        />
      </div>

      <AttendanceChecker allowDropdownOpen={role === "CompanyAdmin"} />

      {canViewAttendance && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-row justify-between items-center">
            <div className="w-44">
              <DatePicker
                label="Select Date"
                selectedDate={selectedDate}
                onChange={ondateChange}
                maxDate={format(new Date(), "yyyy-MM-dd")}
              />
            </div>
            {canModifyAttendanceSettings && <AttendanceSetting />}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : error ? (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : !canViewAttendance ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded text-center">
          You don't have permission to view attendance records.
        </div>
      ) : isHoliday ? (
        <div
          className="bg-pink-100 border-l-4 border-pink-500 text-pink-700 p-4 mb-6"
          role="alert"
        >
          <p className="font-bold">Holiday</p>
          <p>{holidayName}</p>
        </div>
      ) : !shouldShowData ? (
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded text-center">
          You can only view today's attendance records.
        </div>
      ) : attendances.length === 0 ? (
        <div className="bg-gray-100 text-gray-700 p-4 rounded text-center">
          No attendance records found for this date.
        </div>
      ) : (
        <>
          <AttendanceSummary attendances={attendances} />
          <AttendanceTable
            attendances={attendances}
            onStatusChange={handleStatusChange}
            onAttendanceUpdate={handleAttendanceUpdate}
            userRole={role}
            permissions={permissions}
          />
        </>
      )}
    </div>
  );
};

export default DateAttendancePage;
