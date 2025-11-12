import React, { useEffect, useState } from "react";
import { getLeads } from "../../../services/leadServices";
import authServices from "../../../services/authServices";
import { useSelector } from "react-redux";
import { selectUser } from "../../../store/slices/userSlice";

const LeadSection = () => {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const [leadsPermissions, setLeadsPermissions] = useState(null); // Initially null

  const user = useSelector(selectUser);

  const fetchProfile = async () => {
    if (user && user.company) {
      setRole("Employee");
      console.log("response.user.role.permissions", user.role.permissions);
      setLeadsPermissions(user.role.permissions.leads);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        setLoading(true);
        const response = await getLeads();
        setLeads(Array.isArray(response?.data) ? response.data : []);
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      New: "bg-blue-100 text-blue-800",
      Contacted: "bg-yellow-100 text-yellow-800",
      Qualified: "bg-green-100 text-green-800",
      Converted: "bg-purple-100 text-purple-800",
      Closed: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const formattedLeads = Array.isArray(leads)
    ? leads.map((lead) => ({
        id: lead._id,
        name: lead.contact?.name || "Unknown",
        status: lead.status || "unknown",
      }))
    : [];

  const filteredLeads =
    filter === "all"
      ? formattedLeads
      : formattedLeads.filter((lead) => lead.status.toLowerCase() === filter);

  // Check if user has permission to read leads
  const hasReadPermission = leadsPermissions?.read === true; // Explicitly check for true

  return (
    <div
      className={`w-[48%] h-[350px] overflow-y-auto px-6 py-2 rounded-lg shadow-md relative ${
        hasReadPermission ? "bg-white" : "bg-gray-300 text-gray-200"
      }`}
    >
      {/* Blur Effect when no permission */}
      {!hasReadPermission && (
        <div className="absolute inset-0 backdrop-blur-sm bg-white/30 opacity-50 pointer-events-none rounded-lg"></div>
      )}

      <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
        Leads
      </h2>

      <div className="flex space-x-3 mb-6">
        {["all", "new", "contacted", "closed"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              filter === status
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
            disabled={!hasReadPermission}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div colSpan="4" className="flex justify-center items-center h-64 ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filteredLeads?.length === 0 ? (
        <p className="text-center text-gray-500">No leads found.</p>
      ) : (
        <ul className="space-y-3">
          {filteredLeads.map((lead) => (
            <li
              key={lead.id}
              className="p-4 bg-gray-50 rounded-lg flex justify-between items-center"
            >
              <span className="text-gray-700">{lead.name}</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  lead.status
                )}`}
              >
                {lead.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LeadSection;
