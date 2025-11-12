import React from "react";

const SkeletonLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navbar Skeleton */}
      <div className="bg-indigo-600 text-white py-4 px-6 flex justify-between items-center">
        <div className="h-6 w-32 bg-indigo-400 rounded animate-pulse"></div>
        <div className="h-8 w-8 bg-indigo-400 rounded-full animate-pulse"></div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r min-h-screen p-4">
          {/* Close icon */}
          <div className="flex justify-end mb-6">
            <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Sidebar menu items */}
          {Array(9).fill(0).map((_, i) => (
            <div key={i} className="flex items-center mb-6">
              <div className="h-5 w-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
          
          {/* Logout at bottom */}
          <div className="mt-auto pt-10 flex items-center">
            <div className="h-5 w-5 bg-gray-200 rounded mr-3 animate-pulse"></div>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Dashboard Title */}
          <div className="mb-8">
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Top Sections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Leads Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-6 animate-pulse"></div>
              
              {/* Filter buttons */}
              <div className="flex mb-6 space-x-2">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
              
              {/* Lead items */}
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex justify-between items-center py-4 border-b">
                  <div className="h-5 w-20 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
              ))}
            </div>

            {/* Employee List Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
              
              {/* Employee Card */}
              <div className="flex items-start mb-4">
                {/* Avatar */}
                <div className="h-12 w-12 bg-gray-200 rounded-full mr-4 animate-pulse"></div>
                
                <div className="flex-1">
                  {/* Name */}
                  <div className="h-5 w-24 bg-gray-200 rounded mb-2 animate-pulse"></div>
                  
                  {/* Details */}
                  {Array(4).fill(0).map((_, i) => (
                    <div key={i} className="h-4 w-full bg-gray-200 rounded mb-2 animate-pulse"></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 w-24 bg-gray-200 rounded mb-6 animate-pulse"></div>
              
              {/* Filter buttons */}
              <div className="flex mb-6 space-x-2">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-8 w-24 bg-gray-200 rounded-full animate-pulse"></div>
                ))}
              </div>
              
              {/* No events message */}
              <div className="flex justify-center items-center py-12">
                <div className="h-5 w-40 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Sticky Notes Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-6 w-32 bg-gray-200 rounded mb-6 animate-pulse"></div>
            
            {/* Notes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-yellow-100 p-4 rounded-lg relative">
                  {/* Note Header */}
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-16 bg-yellow-200 rounded animate-pulse"></div>
                    <div className="flex space-x-1">
                      <div className="h-4 w-4 bg-yellow-200 rounded-full animate-pulse"></div>
                      <div className="h-4 w-4 bg-yellow-200 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                  
                  {/* Note Content */}
                  <div className="h-4 w-full bg-yellow-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-4 w-5/6 bg-yellow-200 rounded mb-1 animate-pulse"></div>
                  <div className="h-4 w-4/6 bg-yellow-200 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonLoader;