import React, { useEffect, useState } from "react";

const LeadSection = ({ leads }) => {
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Map leads to required format
  const formattedLeads =
    leads?.map((lead) => ({
      id: lead._id,
      name: lead.contact?.name || "Unknown",
      status: lead.status,
    })) || [];

  const filteredLeads =
    filter === "all"
      ? formattedLeads
      : formattedLeads.filter((lead) => lead.status.toLowerCase() === filter);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
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

  return (
    <div className="w-[400px] h-[350px] overflow-y-auto px-6 py-2 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">
        Leads
      </h2>
      <div className="flex space-x-3 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("new")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "new"
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          New
        </button>
        <button
          onClick={() => setFilter("contacted")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "contacted"
              ? "bg-yellow-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Contacted
        </button>
        <button
          onClick={() => setFilter("closed")}
          className={`px-4 py-2 rounded-full text-sm font-medium ${
            filter === "closed"
              ? "bg-red-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Closed
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64 ">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No Leads Available</div>
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
