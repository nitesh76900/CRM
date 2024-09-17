import React from 'react'
import {Link} from 'react-router-dom'
function UserDashboardPage() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-2xl font-bold">
          <Link to="#">YourLogo</Link> {/* Adjust as needed */}
        </div>
        <div className="space-x-4">
          <Link
            to="/meeting-request"
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Meeting Request
          </Link>
          <Link
            to="/project-status"
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Project Status
          </Link>
          <Link
            to="/query"
            className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
          >
            Query
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default UserDashboardPage