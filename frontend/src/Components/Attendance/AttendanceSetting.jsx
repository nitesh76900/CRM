import React, { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import attendanceService from "../../services/attendanceServices";

const AttendanceSetting = () => {
  const [attendanceBy, setAttendanceBy] = useState("AssignedEmp");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAttendanceSettings();
  }, []);

  const fetchAttendanceSettings = async () => {
    try {
      setLoading(true);
      const result = await attendanceService.getAttendanceBy();
      setAttendanceBy(result.attendanceBy);
    } catch (error) {
      toast.error(error.message || "Failed to fetch attendance settings");
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceByChange = async (value) => {
    try {
      setLoading(true);
      await attendanceService.setAttendanceBy(value);
      setAttendanceBy(value);
      toast.success("Attendance settings updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update attendance settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium text-gray-700">
        Who can mark Attendance
      </label>
      <select
        value={attendanceBy}
        onChange={(e) => handleAttendanceByChange(e.target.value)}
        disabled={loading}
        className="w-48 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        {/* <option disabled>Select</option> */}
        <option value="Self">Self & Assigned Employee</option>
        <option value="AssignedEmp">Assigned Employee</option>
      </select>
      {loading && (
        <div className="mt-2 text-sm text-gray-500">Loading...</div>
      )}
    </div>
  );
};

export default AttendanceSetting;