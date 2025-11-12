import React from 'react';
import { format } from 'date-fns';

const HolidayList = ({ holidays, onEdit, onDelete, loading }) => {
  // Helper to format date as YYYY-MM-DD
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy-MM-dd');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-100 h-16 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (holidays.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p className="text-gray-600 text-lg">No holidays found for the selected date range</p>
        <p className="text-gray-500 mt-2">Add a new holiday using the button above</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Holiday List</h2>
      
      <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Holiday Name
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {holidays.sort((a, b) => new Date(a.date) - new Date(b.date)).map((holiday) => (
              <tr key={holiday._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {formatDate(holiday.date)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{holiday.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(holiday)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4 transition duration-150 ease-in-out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => onDelete(holiday._id)}
                    className="text-red-600 hover:text-red-900 transition duration-150 ease-in-out"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HolidayList;