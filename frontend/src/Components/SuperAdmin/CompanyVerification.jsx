import { useEffect, useMemo, useState } from "react";
import {
  getAllCompanies,
  getVerifiedCompanies,
  getUnverifiedCompanies,
  verifyCompany,
  toggleCompanyStatus,
  rejectedVerificationsCompany,
} from "../../services/superAdminServices";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Tab, Tabs } from "@mui/material";
import { Search } from "lucide-react";

const CompanyTable = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [allCompanies, setAllCompanies] = useState([]);
  const [verifiedCompanies, setVerifiedCompanies] = useState([]);
  const [unverifiedCompanies, setUnverifiedCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setloading] = useState(true);
  const [loadingCompanyId, setLoadingCompanyId] = useState(null);

  // Fetch functions with improved error handling and logging
  const fetchVerifiedCompanies = async () => {
    try {
      const response = await getVerifiedCompanies();
      console.log("Verified Companies Response:", response);
      // Adjust based on actual response structure
      setVerifiedCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch verified companies:", error);
      toast.error(error.message || "Failed to fetch verified companies");
      setVerifiedCompanies([]);
    }
  };

  const fetchAllCompanies = async () => {
    try {
      const response = await getAllCompanies();
      console.log("All Companies Response:", response);
      // Adjust based on actual response structure
      setAllCompanies(response.company || response.data || []);
    } catch (error) {
      console.error("Failed to fetch all companies:", error);
      toast.error(error.message || "Failed to fetch companies");
      setAllCompanies([]);
    }
  };

  const fetchUnverifiedCompanies = async () => {
    try {
      const response = await getUnverifiedCompanies();
      console.log("Unverified Companies Response:", response);
      setUnverifiedCompanies(response.data || []);
    } catch (error) {
      console.error("Failed to fetch unverified companies:", error);
      // toast.error(error.message || "Failed to fetch unverified companies");
      setUnverifiedCompanies([]);
    }
  };

  // Action handlers (remain the same)
  const handleVerifyCompany = async (companyId) => {
    setLoadingCompanyId(companyId);
    try {
      await verifyCompany(companyId);
      toast.success("Company verified successfully");
      // Refresh data
      fetchAllCompanies();
      fetchVerifiedCompanies();
      fetchUnverifiedCompanies();
    } catch (err) {
      console.log("err", err);
      toast.error(err.message || "Failed to verify company");
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const handleRejectCompany = async (companyId) => {
    setLoadingCompanyId(companyId);
    try {
      await rejectedVerificationsCompany(companyId);
      toast.success("Company verification rejected");
      // Refresh data
      fetchAllCompanies();
      fetchVerifiedCompanies();
      fetchUnverifiedCompanies();
    } catch (error) {
      console.log("error", error);
      toast.error(error?.response?.data.message || "Failed to reject company");
    } finally {
      setLoadingCompanyId(null);
    }
  };

  const handleToggleCompanyStatus = async (companyId) => {
    try {
      await toggleCompanyStatus(companyId);
      toast.success("Company status updated");
      // Refresh data
      fetchAllCompanies();
      fetchVerifiedCompanies();
      fetchUnverifiedCompanies();
    } catch (error) {
      console.log("error", error.message);
      toast.error(error.message || "Failed to update company status");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setloading(true);
      await fetchAllCompanies();
      await fetchVerifiedCompanies();
      await fetchUnverifiedCompanies();
      setloading(false);
    };
    fetchData();
  }, []);

  // Improved search function with null/undefined checks
  const filterCompanies = (companies) => {
    if (!searchTerm) return companies;

    const searchTermLower = searchTerm.toLowerCase();

    return companies.filter((company) => {
      // Ensure all properties exist and are strings before searching
      const name = company.name?.toLowerCase() || "";
      const email = company.email?.toLowerCase() || "";
      const phoneNo = company.phoneNo?.toLowerCase() || "";

      return (
        name.includes(searchTermLower) ||
        email.includes(searchTermLower) ||
        phoneNo.includes(searchTermLower)
      );
    });
  };

  // Memoized filtered companies for each tab
  const filteredAllCompanies = useMemo(() => {
    console.log("All Companies:", allCompanies);
    return filterCompanies(allCompanies);
  }, [allCompanies, searchTerm]);

  const filteredVerifiedCompanies = useMemo(() => {
    console.log("Verified Companies:", verifiedCompanies);
    return filterCompanies(verifiedCompanies);
  }, [verifiedCompanies, searchTerm]);

  const filteredUnverifiedCompanies = useMemo(() => {
    console.log("Unverified Companies:", unverifiedCompanies);
    return filterCompanies(unverifiedCompanies);
  }, [unverifiedCompanies, searchTerm]);

  if (loading)
    return (
      <div colSpan="4" className="flex justify-center items-center h-64 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );

  // Status badge color mapping
  const getStatusColor = (status) => {
    switch (status) {
      case "Verify":
        return "bg-green-100 text-green-500";
      case "Pending":
        return "bg-yellow-100 text-yellow-500";
      case "Rejected":
        return "bg-red-100 text-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Render company table
  const renderCompanyTable = (
    companies,
    showVerifyActions = false,
    showStatusToggle = false
  ) => (
    <div className="overflow-x-auto shadow-md sm:rounded-lg mt-6">
      {companies.length === 0 ? (
        <div className="flex justify-center items-center p-8 bg-white border-b">
          <div className="text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h14a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {searchTerm
                ? "No companies found matching your search"
                : "No companies available"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm
                ? "Try adjusting your search criteria."
                : activeTab === 0
                ? "No companies have been registered yet."
                : activeTab === 1
                ? "No verified companies available."
                : "No companies pending verification."}
            </p>
          </div>
        </div>
      ) : (
        <table className="w-full text-sm text-left text-gray-500 ">
          <thead className="text-xs text-white uppercase bg-indigo-600">
            <tr>
              <th scope="col" className="px-6 py-3">
                Company Name
              </th>
              <th scope="col" className="px-6 py-3">
                Email
              </th>
              <th scope="col" className="px-6 py-3">
                Phone
              </th>
              <th scope="col" className="px-6 py-3">
                Status
              </th>
              {showVerifyActions && (
                <th scope="col" className="px-6 py-3 text-center">
                  Verification Actions
                </th>
              )}
              {showStatusToggle && (
                <th scope="col" className="px-6 py-3 text-center">
                  Active/Deactive
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr
                key={company._id}
                className="bg-white border-b hover:bg-gray-50"
              >
                <td className="px-6 py-4 font-medium text-gray-900">
                  {company.name}
                </td>
                <td className="px-6 py-4">{company.email}</td>
                <td className="px-6 py-4">{company.phoneNo}</td>
                <td className="px-6 py-4">
                  <span
                    className={`${getStatusColor(company.verify)} 
                       text-xs font-medium mr-2 px-2.5 py-0.5 rounded`}
                  >
                    {company.verify}
                  </span>
                </td>
                {showVerifyActions && (
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleVerifyCompany(company._id)}
                        disabled={loadingCompanyId === company._id}
                        className="text-white bg-blue-700 hover:bg-blue-800 
          focus:ring-4 focus:ring-blue-300 font-medium rounded-lg 
          text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingCompanyId === company._id
                          ? "Verifying..."
                          : "Verify"}
                      </button>

                      <button
                        onClick={() => handleRejectCompany(company._id)}
                        disabled={loadingCompanyId === company._id}
                        className="text-white bg-red-700 hover:bg-red-800 
          focus:ring-4 focus:ring-red-300 font-medium rounded-lg 
          text-sm px-3 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loadingCompanyId === company._id
                          ? "Rejecting..."
                          : "Reject"}
                      </button>
                    </div>
                  </td>
                )}

                {showStatusToggle && (
                  <td className="px-6 py-4 text-center">
                    <label
                      className={`inline-flex items-center ${
                        company.verify !== "Verify"
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={company.isActive}
                        onChange={() =>
                          company.verify !== "Rejected" &&
                          handleToggleCompanyStatus(company._id)
                        }
                        disabled={company.verify !== "Verify"}
                        className="sr-only peer"
                      />
                      <div
                        className={`relative w-11 h-6 bg-gray-200 peer-focus:outline-none 
                peer-focus:ring-4 peer-focus:ring-blue-300 
                rounded-full peer ${
                  company.verify !== "Rejected" &&
                  "peer-checked:after:translate-x-full"
                } 
                rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white 
                after:content-[''] after:absolute after:top-[2px] after:start-[2px] 
                after:bg-white after:border-gray-300 after:border after:rounded-full 
                after:h-5 after:w-5 after:transition-all 
                ${company.verify !== "Rejected" && "peer-checked:bg-blue-600"}`}
                      ></div>
                    </label>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <ToastContainer position="top-center" autoClose={3000} />

      <div className="mb-4 flex items-center">
        <div className="relative w-full">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="search"
            placeholder="Search companies by name, email, or phone"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg 
              bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        variant="fullWidth"
      >
        <Tab label="All Companies" />
        <Tab label="Verified Companies" />
        <Tab label="Unverified Companies" />
      </Tabs>

      {activeTab === 0 && renderCompanyTable(filteredAllCompanies, false, true)}
      {activeTab === 1 &&
        renderCompanyTable(filteredVerifiedCompanies, false, true)}
      {activeTab === 2 &&
        renderCompanyTable(filteredUnverifiedCompanies, true, false)}
    </div>
  );
};

export default CompanyTable;
