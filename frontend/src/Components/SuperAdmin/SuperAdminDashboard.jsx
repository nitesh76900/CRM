import React, { useEffect, useState } from 'react'
import { getSuperAdminDashboardData } from '../../services/superAdminServices';
import { toast } from 'react-toastify';
import { Info } from 'lucide-react'; // Add this import for the Info icon

function SuperAdminDashboard() {

  const [data, setData] = useState();
  const [loading, setLoading] = useState(true);
  

  const fetchDashboardData = async () => {
    try {
      const response = await getSuperAdminDashboardData();
      console.log("dashboard response", response);
      setData(response)
    } catch (error) {
      console.log(error)
      toast.error(error?.response?.data.message)
    } finally{
      setLoading(false)
    }
  };

  useEffect( () => {
    fetchDashboardData()
  },[])


  const tooltipInfo = {
    // Companies section
    totalCompanies: "Total number of companies registered in the system",
    activeCompanies: "Companies that are currently active and operational",
    inactiveCompanies: "Companies that have been deactivated or are no longer operational",
    pendingVerifications: "Companies awaiting verification of their documents or information",
    rejectedVerifications: "Companies whose verification has been rejected due to invalid information",
    
    // Employees section
    totalEmployees: "Total number of employees across all companies",
    totalActiveEmployees: "Employees that are currently active in the system",
    totalInactiveEmployees: "Employees that have been deactivated or are no longer active",
    totalVerifiedEmployees: "Employees whose information has been verified and approved",
    pendingVerificationsEmployees: "Employees awaiting verification of their documents or information",
    rejectedVerificationsEmployees: "Employees whose verification has been rejected due to invalid information"
  };

  const [activeTooltip, setActiveTooltip] = useState(null);

  const toggleTooltip = (key) => {
    if (activeTooltip === key) {
      setActiveTooltip(null);
    } else {
      setActiveTooltip(key);
    }
  };
  
  if (loading)
    return(
      <div colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
    )


 
  
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      <div>
        <h1 className="text-2xl font-semibold mt-6">Companies</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {Object.entries(data.data.companies).map(([key, value]) => (
            <div key={key} className="p-4 bg-white shadow rounded-lg relative">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{key.replace(/([A-Z])/g, " $1").trim()}</h2>
                <div className="relative">
                  <Info 
                    size={18} 
                    className="text-blue-500 cursor-pointer hover:text-blue-700" 
                    onMouseEnter={() => toggleTooltip(key)} 
                    onMouseLeave={() => toggleTooltip(null)}
                  />
                  {activeTooltip === key && (
                    <div className="absolute right-0 w-64 p-2 mt-2 text-sm bg-gray-800 text-white rounded shadow-lg z-10">
                      {tooltipInfo[key]}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold mt-6">Employees</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
          {Object.entries(data.data.employees).map(([key, value]) => (
            <div key={key} className="p-4 bg-white shadow rounded-lg relative">
              <div className="flex justify-between items-start">
                <h2 className="text-lg font-semibold">{key.replace(/([A-Z])/g, " $1").trim()}</h2>
                <div className="relative">
                  <Info 
                    size={18} 
                    className="text-blue-500 cursor-pointer hover:text-blue-700" 
                    onMouseEnter={() => toggleTooltip(key)} 
                    onMouseLeave={() => toggleTooltip(null)}
                  />
                  {activeTooltip === key && (
                    <div className="absolute right-0 w-64 p-2 mt-2 text-sm bg-gray-800 text-white rounded shadow-lg z-10">
                      {tooltipInfo[key]}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xl font-bold mt-2">{value}</p>
            </div>
          ))}
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold mt-6">Recent Companies</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {data.data.recentCompanies.map((company, index) => (
          <div
            key={index}
            className="bg-white p-6 shadow-lg rounded-xl flex items-center space-x-6 transition-transform transform hover:scale-102 duration-300"
          >
            {/* Company Logo */}
            <img
              src={company.image.url}
              alt={company.name}
              className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 shadow-md"
            />

            {/* Company Details */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">{company.name}</h3>
              <p className="text-md text-gray-600">{company.industry}</p>
              <p className="text-md text-gray-500">
                {company.address.city}, {company.address.state}
              </p>

              {/* Verification Badge */}
              <span
                className={`mt-3 inline-block px-4 py-1 text-sm font-semibold rounded-full 
                ${
                  company.verify === "Verify"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {company.verify}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SuperAdminDashboard