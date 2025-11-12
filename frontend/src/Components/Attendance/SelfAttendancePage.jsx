import React, { useState, useEffect } from "react";
import { format, startOfMonth, subDays, parseISO } from "date-fns";

import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Wifi,
  AlertTriangle,
} from "lucide-react";
import attendanceService from "../../services/attendanceServices";
import markAttendanceServices from "../../services/markAttendanceServices";
import { ToastContainer } from "react-toastify";
import AttendanceChecker from "./AttendanceChecker";
import { useLocationIP } from "./LocationIPContext";

const SelfAttendancePage = () => {
  const [dateRange, setDateRange] = useState({
    startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    endDate: format(new Date(), "yyyy-MM-dd"),
  });

  const [attendanceData, setAttendanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [attendanceBy, setAttendanceBy] = useState(null);
  const [checkSettings, setCheckSettings] = useState(null);

  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingNetworkIp, setIsLoadingNetworkIp] = useState(false);

  const [isSelfAttendance, setIsSelfAttendance] = useState(false);
  const [locationData, setLocationData] = useState(null);
  const [networkIp, setNetworkIp] = useState(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [isCheckedOut, setIsCheckedOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isTodayMarked, setIsTodayMarked] = useState(false);
  const [isTodayHoliday, setIsTodayHoliday] = useState(false);
  const { isReady } = useLocationIP();

  const fetchAttendanceBy = async () => {
    try {
      const attendanceByData = await attendanceService.getAttendanceBy();
      setAttendanceBy(attendanceByData.attendanceBy);
      setIsSelfAttendance(attendanceByData.attendanceBy === "Self");

      if (attendanceByData.attendanceBy === "Self") {
        const checkBySettings = await attendanceService.getAttendanceCheckBy();
        console.log("checkBySettings", checkBySettings);
        setCheckSettings(checkBySettings.attendanceCheckBy);
      }
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
      setIsLoading(false);
    }
  };

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      fetchAttendanceBy();

      const data = await markAttendanceServices.getSelfAttendanceByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      setAttendanceData(data.attendanceRecords);

      const todayAttendance = data?.attendanceRecords.find(
        (record) =>
          format(parseISO(record.date), "yyyy-MM-dd") ===
          format(new Date(), "yyyy-MM-dd")
      );
      if (todayAttendance && todayAttendance.checkIn) {
        setIsCheckedIn(true);
        setIsTodayMarked(true);
      }
      if (todayAttendance && todayAttendance.checkOut) {
        setIsCheckedOut(true);
        setIsTodayMarked(true);
      }
      if (todayAttendance && todayAttendance.status === "Holiday") {
        setIsTodayHoliday(true);
      }

      setIsLoading(false);
    } catch (err) {
      setError(err.message || "Failed to load attendance data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Set up initial loadings
    setIsLoadingLocation(true);
    setIsLoadingNetworkIp(true);

    // Get IP and location
    const getInitialRequirements = async () => {
      if (navigator.geolocation) {
        try {
          const location = await getCurrentLocation();
          setLocationData(location);
        } catch (error) {
          console.error("Initial location error:", error);
        }
      }

      try {
        const ip = await getCurrentIP();
        setNetworkIp(ip);
      } catch (error) {
        console.error("Initial IP error:", error);
      }
    };

    getInitialRequirements();
    loadInitialData();
  }, []);

  const getCurrentIP = async () => {
    try {
      const response = await fetch("https://api64.ipify.org?format=json");
      const data = await response.json();
      setIsLoadingNetworkIp(false);
      return data.ip;
    } catch (error) {
      console.error("Error fetching IP:", error);
      setStatusMessage("Network IP access is required but not available");
      setIsLoadingNetworkIp(false);
      return null;
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setIsLoadingLocation(false);
      throw new Error("Geolocation is not supported by this browser");
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude: lat, longitude: long } = position.coords;
          setIsLoadingLocation(false);
          resolve({ lat, long });
        },
        (error) => {
          console.error("Geolocation error: ", error);
          setIsLoadingLocation(false);
          switch (error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("User denied the request for Geolocation."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("The request to get user location timed out."));
              break;
            default:
              reject(
                new Error("An unknown error occurred while getting location.")
              );
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  const fetchAttendanceData = async () => {
    try {
      setIsLoading(true);
      const data = await markAttendanceServices.getSelfAttendanceByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      console.log("data", data.attendanceRecords);
      setAttendanceData(data.attendanceRecords);
      setIsLoading(false);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to fetch attendance data"
      );
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, [dateRange]);

  const checkRequirements = async () => {
    try {
      if (checkSettings.location?.enable) {
        try {
          const location = await getCurrentLocation();
          setLocationData(location);
        } catch (error) {
          setStatusMessage("Location access is required but not available");
          console.error("Error:", error.message);
        }
      }

      if (checkSettings.networkIp?.enable) {
        const networkIp = await getCurrentIP();
        setNetworkIp(networkIp);
      }
      fetchAttendanceBy();
    } catch (err) {
      console.error("Error checking requirements:", err);
    }
  };

  useEffect(() => {
    fetchAttendanceBy();

    if (!isSelfAttendance || !checkSettings) return;

    checkRequirements();
    const interval = setInterval(checkRequirements, 60000);

    return () => clearInterval(interval);
  }, [isSelfAttendance]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckIn = async () => {
    try {
      setIsSubmitting(true);
      setStatusMessage("Processing check-in...");

      const payload = {};

      if (checkSettings?.location?.enable) {
        if (!locationData) {
          setStatusMessage("Location access is required");
          setIsSubmitting(false);
          return;
        }
        payload.location = locationData;
      }

      if (checkSettings?.networkIp?.enable) {
        if (!networkIp) {
          setStatusMessage("Network IP is required");
          setIsSubmitting(false);
          return;
        }
        payload.networkIp = networkIp;
      }

      await markAttendanceServices.markAttendanceBySelfCheckIn(payload);

      fetchAttendanceData();

      setIsCheckedIn(true);
      setIsTodayMarked(true);
      setStatusMessage("Successfully checked in");
      setIsSubmitting(false);
    } catch (err) {
      setStatusMessage(err?.response?.data?.message || "Failed to check in");
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsSubmitting(true);
      setStatusMessage("Processing check-out...");

      const payload = {};

      if (checkSettings?.location?.enable) {
        if (!locationData) {
          setStatusMessage("Location access is required");
          setIsSubmitting(false);
          return;
        }
        payload.location = locationData;
      }

      if (checkSettings?.networkIp?.enable) {
        if (!networkIp) {
          setStatusMessage("Network IP is required");
          setIsSubmitting(false);
          return;
        }
        payload.networkIp = networkIp;
      }

      await markAttendanceServices.markAttendanceBySelfCheckOut(payload);

      fetchAttendanceData();

      setIsCheckedOut(true);
      setIsCheckedIn(false);
      setStatusMessage("Successfully checked out");
      setIsSubmitting(false);
    } catch (err) {
      setStatusMessage(err?.response?.data?.message || "Failed to check out");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <AttendanceChecker />
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Self Attendance</h1>
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <span className="text-gray-500">
              {format(new Date(), "MMMM d, yyyy")}
            </span>
          </div>
        </div>

        {isSelfAttendance && !isTodayHoliday && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Mark Attendance</h2>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-500" />
                <span className="font-medium">
                  {format(new Date(), "h:mm a")}
                </span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                {(checkSettings?.location?.enable ||
                  checkSettings?.networkIp?.enable) && (
                    <>
                      <h3 className="font-medium">Requirements Status:</h3>
                      <ul className="space-y-2">
                        {checkSettings?.location?.enable && (
                          <li className="flex items-center space-x-2">
                            <MapPin className="h-5 w-5" />
                            <span>Location:</span>
                            {isLoadingLocation ? (
                              <span className="text-blue-500 flex items-center">
                                <div className="animate-spin h-4 w-4 mr-1 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                Loading...
                              </span>
                            ) : locationData ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Available
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Not available
                              </span>
                            )}
                          </li>
                        )}

                        {checkSettings?.networkIp?.enable && (
                          <li className="flex items-center space-x-2">
                            <Wifi className="h-5 w-5" />
                            <span>Network IP:</span>
                            {isLoadingNetworkIp ? (
                              <span className="text-blue-500 flex items-center">
                                <div className="animate-spin h-4 w-4 mr-1 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                Loading...
                              </span>
                            ) : networkIp ? (
                              <span className="text-green-500 flex items-center">
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Available
                              </span>
                            ) : (
                              <span className="text-red-500 flex items-center">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Not available
                              </span>
                            )}
                          </li>
                        )}
                      </ul>
                    </>
                  )}
              </div>

              <div className="flex flex-col justify-center items-center space-y-4">
                {statusMessage && (
                  <div
                    className={`text-sm ${statusMessage.includes("Successfully")
                        ? "text-green-500"
                        : "text-red-500"
                      }`}
                  >
                    {statusMessage}
                  </div>
                )}

                {isCheckedIn ? (
                  <button
                    onClick={handleCheckOut}
                    disabled={
                      (!isReady && (checkSettings?.location?.enable || checkSettings?.networkIp?.enable)) ||
                      isSubmitting || isCheckedOut||
                      isTodayHoliday ||
                      (!locationData && checkSettings?.location?.enable) ||
                      (!networkIp && checkSettings?.networkIp?.enable)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
                  >
                    {isSubmitting ? "Processing..." : "Check Out"}
                  </button>
                ) : (
                  <button
                    onClick={handleCheckIn}
                    disabled={
                      (!isReady && (checkSettings?.location?.enable || checkSettings?.networkIp?.enable)) ||
                      isSubmitting ||
                      isTodayMarked ||
                      isTodayHoliday ||
                      (!locationData && checkSettings?.location?.enable) ||
                      (!networkIp && checkSettings?.networkIp?.enable)
                    }
                    className="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-6 rounded-md disabled:opacity-50 disabled:cursor-not-allowed w-full max-w-xs"
                  >
                    {isSubmitting ? "Processing..." : "Check In"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Filter Attendance</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                max={format(new Date(), "yyyy-MM-dd")} // Disable future dates
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
          ) : attendanceData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
              No attendance records found for the selected date range.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
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
                      Working Hours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((record, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {format(parseISO(record.date), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkIn
                          ? format(parseISO(record.checkIn), "h:mm a")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.checkOut
                          ? format(parseISO(record.checkOut), "h:mm a")
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record?.workHours
                          ? `${record?.workHours?.toFixed(2)} hours`
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {record.status === "Present" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Present
                          </span>
                        ) : record.status === "Absent" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                            Absent
                          </span>
                        ) : record.status === "Half-Day" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-blue-800">
                            Half Day
                          </span>
                        ) : record.status === "Leave" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-red-500">
                            Leave - {record?.leaveType || "N/A"}
                          </span>
                        ) : record.status === "Remote" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-cyan-800">
                            Remote
                          </span>
                        ) : record.status === "Holiday" ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-orange-600">
                            Holiday - {record?.holidayName || "N/A"}
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {record.status || "N/A"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SelfAttendancePage;
