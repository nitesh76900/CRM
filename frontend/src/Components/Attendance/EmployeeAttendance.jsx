import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import markAttendanceServices from "../../services/markAttendanceServices";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast, ToastContainer } from "react-toastify";

const AttendanceTable = ({ employee, attendances }) => {
  // Format date to a readable string
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time if it exists
  const formatTime = (time) => {
    if (!time) return "-";
    return new Date(time).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate work hours if check-in and check-out exist
  const calculateWorkHours = (checkIn, checkOut) => {
    if (!checkIn || !checkOut) return "-";
    const diffMs = new Date(checkOut) - new Date(checkIn);
    return (diffMs / (1000 * 60 * 60)).toFixed(1);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Check In
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Check Out
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Work Hours
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {attendances.map((attendance, index) => (
              <tr
                key={attendance._id}
                className={`hover:bg-blue-50 transition-colors duration-150 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                  {formatDate(attendance.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      attendance.status === "Present"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : attendance.status === "Absent"
                        ? "bg-red-100 text-red-800 border border-red-200"
                        : attendance.status === "Leave"
                        ? "bg-amber-100 text-amber-800 border border-amber-200"
                        : "bg-gray-100 text-gray-800 border border-gray-200"
                    }`}
                  >
                    {attendance.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatTime(attendance.checkIn)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatTime(attendance.checkOut)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {attendance.workHours ||
                    calculateWorkHours(
                      attendance.checkIn,
                      attendance.checkOut
                    )}{" "}
                  {attendance.workHours ||
                  calculateWorkHours(
                    attendance.checkIn,
                    attendance.checkOut
                  ) !== "-"
                    ? "hrs"
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const EmployeeAttendance = () => {
  const { employeeId } = useParams();
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fromDate, setFromDate] = useState(
    new Date(new Date().setDate(new Date().getDate() - 7))
  ); // Default: last 7 days
  const [toDate, setToDate] = useState(new Date()); // Default: today
  const navigate = useNavigate();

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const formattedFromDate = fromDate.toISOString().split("T")[0];
      const formattedToDate = toDate.toISOString().split("T")[0];

      const data =
        await markAttendanceServices.getEmployeeAttendanceByDateRange(
          employeeId,
          formattedFromDate,
          formattedToDate
        );
      setAttendanceData(data);
    } catch (error) {
      toast.error(
        error?.response.data.message ||
          "Error in fetching Employee Attendance Record"
      );
      console.error("Error fetching attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [employeeId]); // Initial fetch with default dates

  const handleDateFilter = () => {
    fetchAttendance();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 py-10 px-4 sm:px-6 lg:px-8">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <button
            onClick={() => navigate(-1)}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center gap-2 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back
          </button>
          <div className="text-center sm:text-right">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              Attendance Records
            </h1>
            {attendanceData?.employee?.user?.name && (
              <div className="text-indigo-600 font-medium">
                {attendanceData.employee.user.name}
                <span className="text-gray-500 ml-2">
                  ({attendanceData.employee.user.email})
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Date Filter Section */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2 text-indigo-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                clipRule="evenodd"
              />
            </svg>
            Filter Attendance
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <DatePicker
                selected={fromDate}
                onChange={(date) => setFromDate(date)}
                maxDate={new Date()}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <DatePicker
                selected={toDate}
                onChange={(date) => setToDate(date)}
                maxDate={new Date()}
                minDate={fromDate}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors duration-200"
                dateFormat="yyyy-MM-dd"
              />
            </div>
            <button
              onClick={handleDateFilter}
              disabled={loading}
              className={`px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Loading...
                </div>
              ) : (
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Apply Filter
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          </div>
        )}

        {/* Attendance Data */}
        {!loading && attendanceData?.success && (
          <div className="mb-8">
            <div className="mb-6 flex justify-between items-center">
              <div className="text-lg font-semibold text-gray-900 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-indigo-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
                Attendance History
              </div>
              <div className="text-sm text-gray-500">
                Showing {attendanceData.attendances.length} records
              </div>
            </div>
            <AttendanceTable
              employee={attendanceData.employee}
              attendances={attendanceData.attendances}
            />
          </div>
        )}

        {/* No Data State */}
        {!loading && attendanceData && !attendanceData.success && (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-300 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="text-xl font-medium text-gray-700 mb-2">
              No attendance data available
            </div>
            <p className="text-gray-500">
              No records found for the selected date range. Try adjusting your
              filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeAttendance;
