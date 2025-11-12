import React, { useState, useEffect } from 'react';
import markAttendanceServices from '../../services/markAttendanceServices';

const AttendanceAnalysisPage = () => {
  // Get current month and year for initial values
  const currentDate = new Date();
  const [month, setMonth] = useState(currentDate.getMonth() + 1); // JavaScript months are 0-indexed
  const [year, setYear] = useState(currentDate.getFullYear());
  const [data, setData] = useState({ success: false, analysis: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Generate month options
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Generate year options (5 years back and 5 years forward)
  const currentYear = currentDate.getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  useEffect(() => {
    fetchAttendanceData();
  }, [month, year]);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await markAttendanceServices.getAttendanceAnalysis(month, year);
      setData(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMonthChange = (e) => {
    setMonth(parseInt(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(parseInt(e.target.value));
  };

  // Calculate overall statistics
  const calculateStatistics = () => {
    if (!data.analysis || data.analysis.length === 0) return null;
    
    let totalEmployees = data.analysis.length;
    let totalHoliday = data.totalHolidays;
    
    return {
      totalEmployees,
      totalHoliday
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="p-6 max-w-full bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Attendance Analysis</h1>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-auto">
              <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">Month</label>
              <select
                id="month"
                value={month}
                onChange={handleMonthChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="w-full sm:w-auto">
              <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <select
                id="year"
                value={year}
                onChange={handleYearChange}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <div className="text-sm text-blue-500 font-medium">Total Employees</div>
              <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            </div>
            <div className="flex justify-between bg-red-50 p-4 rounded-lg border border-red-100 py-auto">
              <div className="text-md text-red-500 font-medium">Total Holiday<br/> In This Month</div>
              <div className="text-5xl font-bold">{stats.totalHoliday}</div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-500 p-4 rounded-md text-center">
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Employee</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Present</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Absent</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Half Day</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Leave</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Remote</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Total Working Hours</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Avg Working Hours</th>
                  <th className="py-3 px-4 text-center text-xs font-medium text-gray-600 uppercase tracking-wider border-b">Total Working Days</th>
                </tr>
              </thead>
              <tbody>
                {data.analysis && data.analysis.length > 0 ? (
                  data.analysis.map((employee) => (
                    <tr key={employee.employeeId} className="hover:bg-gray-50 border-b">
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-gray-800">{employee.name}</span>
                          <span className="text-xs text-gray-500">{employee.email}</span>
                          <span className="text-xs text-gray-500">{employee.designation}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-green-800 bg-green-100 rounded-full">
                          {employee.totalPresent}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-800 bg-red-100 rounded-full">
                          {employee.totalAbsent}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-yellow-800 bg-yellow-100 rounded-full">
                          {employee.totalHalfDay}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-purple-800 bg-purple-100 rounded-full">
                          {employee.totalLeave}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-blue-800 bg-blue-100 rounded-full">
                          {employee.totalRemote}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {parseFloat(employee.totalWorkingHours).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {typeof employee.avgWorkingHours === 'string' ? employee.avgWorkingHours : parseFloat(employee.avgWorkingHours).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-medium">
                        {employee.totalWorkingDays}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="py-8 text-center text-gray-500">
                      No attendance data available for this period
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalysisPage;