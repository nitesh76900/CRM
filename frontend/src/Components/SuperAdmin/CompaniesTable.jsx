import React, { useState, useEffect } from "react";
import { getCompanies } from "../../services/companyServices";
import { useNavigate } from "react-router";

const CompaniesList = () => {
  const [companies, setCompanies] = useState([]);
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await getCompanies();
        console.log("response", response.data);
        setCompanies(response.data);
        setFilteredCompanies(response.data);
        setLoading(false);
      } catch (err) {
        setError(
          err?.response?.data.message ||
            "Failed to save note. Please try again."
        );
        setLoading(false);
        console.error("Error fetching companies:", err);
      }
    };

    fetchCompanies();
  }, []);

  // Sort function
  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  // Apply sort
  useEffect(() => {
    let sortableItems = [...filteredCompanies];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Handle nested properties like "owner.name"
        const keyParts = sortConfig.key.split(".");
        let aValue = a;
        let bValue = b;

        // Navigate through nested properties
        for (const part of keyParts) {
          aValue = aValue[part];
          bValue = bValue[part];
        }

        // Handle date comparison
        if (sortConfig.key === "owner.createdAt") {
          const dateA = new Date(aValue);
          const dateB = new Date(bValue);
          if (sortConfig.direction === "ascending") {
            return dateA - dateB;
          }
          return dateB - dateA;
        }

        // Regular string comparison
        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    setFilteredCompanies(sortableItems);
  }, [sortConfig]);

  // Search function
  useEffect(() => {
    if (searchTerm === "") {
      setFilteredCompanies(companies);
    } else {
      const filtered = companies.filter((company) => {
        // Search in company name
        if (company.name.toLowerCase().includes(searchTerm.toLowerCase()))
          return true;

        // Search in owner details
        if (company.owner.name.toLowerCase().includes(searchTerm.toLowerCase()))
          return true;
        if (
          company.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return true;
        if (
          company.owner.phoneNo.toLowerCase().includes(searchTerm.toLowerCase())
        )
          return true;

        return false;
      });
      setFilteredCompanies(filtered);
    }
  }, [searchTerm, companies]);

  // Get sort direction indicator
  const getSortDirectionIndicator = (name) => {
    const key =
      name === "Name"
        ? "name"
        : name === "Owner Name"
        ? "owner.name"
        : name === "Owner Email"
        ? "owner.email"
        : name === "Owner Contact"
        ? "owner.phoneNo"
        : name === "Company Register date"
        ? "owner.createdAt"
        : null;

    if (sortConfig.key !== key) {
      return "⇅";
    }
    return sortConfig.direction === "ascending" ? "↑" : "↓";
  };

  if (loading) {
    return (
      <div colSpan="4" className="flex justify-center items-center h-64 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-6">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          Companies List ({filteredCompanies.length} of {companies.length})
        </h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search companies..."
            className="border border-gray-300 rounded-md py-2 px-4 pl-10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute left-3 top-3 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-indigo-600 text-white">
            <tr>
              <th className="px-4 py-2 text-left">S. No.</th>

              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-indigo-700"
                onClick={() => requestSort("name")}
              >
                Name {getSortDirectionIndicator("Name")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-indigo-700"
                onClick={() => requestSort("owner.name")}
              >
                Owner Name {getSortDirectionIndicator("Owner Name")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-indigo-700"
                onClick={() => requestSort("owner.email")}
              >
                Owner Email {getSortDirectionIndicator("Owner Email")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-indigo-700"
                onClick={() => requestSort("owner.phoneNo")}
              >
                Owner Contact {getSortDirectionIndicator("Owner Contact")}
              </th>
              <th
                className="px-4 py-2 text-left cursor-pointer hover:bg-indigo-700"
                onClick={() => requestSort("owner.createdAt")}
              >
                Company Register date{" "}
                {getSortDirectionIndicator("Company Register date")}
              </th>
              <th className="px-4 py-2 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCompanies.length > 0 ? (
              filteredCompanies.map((company, index) => (
                <tr key={company._id} className="hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium">{index + 1}</td>
                  <td className="px-4 py-4 font-medium">{company.name}</td>
                  <td className="px-4 py-4 ">
                    <div className="text-sm text-gray-900">
                      {company.owner.name}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {company.owner.email}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {company.owner.phoneNo}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="text-sm text-gray-900">
                      {company.owner.createdAt.split("T")[0]}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex space-x-2">
                      <button
                        className="text-blue-600 hover:text-blue-800"
                        onClick={() =>
                          navigate(`/company-details/${company._id}`)
                        }
                      >
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-4 py-4 text-center">
                  No companies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompaniesList;
