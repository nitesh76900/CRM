import React, { useState, useEffect } from "react";
import HolidayService from "../../../services/holidaysServices";
import { format } from "date-fns";
import HolidayForm from "./HolidayForm";
import HolidayList from "./HolidayList";
import { toast, ToastContainer } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

const AttendanceHolidays = () => {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHoliday, setEditingHoliday] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Date range for fetching holidays (current year by default)it
  const currentYear = new Date().getFullYear();
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  // Fetch holidays on component mount and when date range changes
  useEffect(() => {
    fetchHolidays();
  }, [dateRange]);

  const fetchHolidays = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      const today = new Date();
      
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const startDate = `${firstDay.getFullYear()}-${String(firstDay.getMonth() + 1).padStart(2, '0')}-${String(firstDay.getDate()).padStart(2, '0')}`;
      
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const endDate = `${lastDay.getFullYear()}-${String(lastDay.getMonth() + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
      
      // console.log("Formatted start date:", startDate);
      // console.log("Formatted end date:", endDate);    
      
      setDateRange({
        startDate: startDate,
        endDate: endDate
      });
      return;
    }

    try {
      setLoading(true);
      const response = await HolidayService.getHolidaysByDateRange(
        dateRange.startDate,
        dateRange.endDate
      );
      console.log("response holiday", response);
      setHolidays(response.holidays);
    } catch (error) {
      toast.error("Failed to fetch holidays");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHoliday = async (holidayData) => {
    try {
      setLoading(true);
      await HolidayService.addHoliday(holidayData);
      toast.success("Holiday added successfully");
      fetchHolidays();
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to add holiday");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateHoliday = async (id, updatedData) => {
    try {
      setLoading(true);
      await HolidayService.updateHoliday(id, updatedData);
      toast.success("Holiday updated successfully");
      fetchHolidays();
      setEditingHoliday(null);
      setIsFormOpen(false);
    } catch (error) {
      toast.error(error.message || "Failed to update holiday");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHoliday = async (id) => {
    if (window.confirm("Are you sure you want to delete this holiday?")) {
      try {
        setLoading(true);
        await HolidayService.deleteHoliday(id);
        toast.success("Holiday deleted successfully");
        fetchHolidays();
      } catch (error) {
        toast.error(error.message || "Failed to delete holiday");
      } finally {
        setLoading(false);
      }
    }
  };

  const openEditForm = (holiday) => {
    setEditingHoliday(holiday);
    setIsFormOpen(true);
  };

  const handleYearChange = (year) => {
    setDateRange({
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    });
  };

  const currentYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(i);
    }
    return years;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <ToastContainer
        position="top-centert"
        autoClose={3000}
        style={{ marginTop: "50px" }}
      />

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
          <h1 className="text-3xl font-bold text-white">Holiday Management</h1>
          <p className="text-blue-100 mt-2">
            Manage company holidays and important dates
          </p>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="flex items-center space-x-4">
                <label
                  htmlFor="startDate"
                  className="text-gray-700 font-medium"
                >
                  Start Date:
                </label>
                <input
                  id="startDate"
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-4">
                <label htmlFor="endDate" className="text-gray-700 font-medium">
                  End Date:
                </label>
                <input
                  id="endDate"
                  type="date"
                  className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              onClick={() => {
                setEditingHoliday(null);
                setIsFormOpen(true);
              }}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-300 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Holiday
            </button>
          </div>

          {isFormOpen && (
            <HolidayForm
              initialData={editingHoliday}
              onSubmit={
                editingHoliday
                  ? (data) => handleUpdateHoliday(editingHoliday._id, data)
                  : handleAddHoliday
              }
              onCancel={() => {
                setIsFormOpen(false);
                setEditingHoliday(null);
              }}
            />
          )}

          <HolidayList
            holidays={holidays}
            onEdit={openEditForm}
            onDelete={handleDeleteHoliday}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default AttendanceHolidays;
