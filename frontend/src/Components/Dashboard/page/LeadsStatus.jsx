import React, { useState, useEffect } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const LeadStatusChart = ({ statusStats }) => {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  )
    .toISOString()
    .split("T")[0];
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  )
    .toISOString()
    .split("T")[0];

  const [startDate, setStartDate] = useState(firstDayOfMonth);
  const [endDate, setEndDate] = useState(lastDayOfMonth);
  const [filteredData, setFilteredData] = useState([]);

  const filterDataByDateRange = () => {
    if (!statusStats) return;

    // Transform the data directly from statusStats
    const pieChartData = statusStats.map((stat) => ({
      name: stat._id, // Using _id as name since it contains the status
      value: stat.count, // Using count as the value
    }));

    setFilteredData(pieChartData);
  };

  useEffect(() => {
    if (statusStats) {
      filterDataByDateRange();
    }
  }, [statusStats]); // Update when statusStats changes

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div className="w-[48%] p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Lead Status</h2>

      {/* Date Range Inputs and Search Button */}
      <div className="flex space-x-4 mb-6">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        />
        <button
          onClick={filterDataByDateRange}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Search
        </button>
      </div>

      {/* Pie Chart */}
      <div className="h-64">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-center">
            No leads found for the selected date range.
          </p>
        )}
      </div>
    </div>
  );
};

export default LeadStatusChart;
