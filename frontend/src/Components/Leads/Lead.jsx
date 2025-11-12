import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
  addFollowUp,
  changeLeadStatus,
  createLead,
  getLeadById,
  getLeads,
  updateLead,
} from "../../services/leadServices";
import LeadCard from "./LeadCard";
import LeadDetailsModal from "./LeadDetailsModal";
import LeadFormModal from "./LeadFormModal";
import { ToastContainer, toast } from "react-toastify";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";

const Lead = () => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [viewLead, setViewLead] = useState(null);
  const searchTimeout = useRef(null);
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [leads, setLeads] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState("kanban");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    assignedTo: "",
  });
  const [allLeads, setAllLeads] = useState([]); // Store all leads from API
  const [searchTerm, setSearchTerm] = useState(""); // Separate from API filters
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    leadForId: "",
    leadSourceId: "",
    contact: {
      name: "",
      email: "",
      phoneNo: "",
    },
    priority: "Medium",
    reference: {
      name: "",
      email: "",
      phoneNo: "",
    },
    remark: "",
    assignedTo: "",
  });
  const [role, setRole] = useState("");
  const [leadsPermissions, setLeadsPermissions] = useState(null);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (user && user.company) {
      setRole("Employee");
      console.log("response.user.role.permissions", user.role.permissions);
      setLeadsPermissions(user.role.permissions.leads);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  }, [user]);

  // Fetch all necessary data
  const fetchLeads = async () => {
    try {
      setLoading(true);
      const response = await getLeads({
        status: filters.status,
        assignedTo: filters.assignedTo,
      });

      if (!response?.data || response.data.length === 0) {
        setAllLeads([]);
        setLeads([]); // ✅ Ensure `leads` is an array
        toast.warn("No leads available");
        return;
      }

      const leads = response.data;
      setAllLeads(leads);

      // Apply frontend search filter
      const filteredLeads = searchTerm ? filterLeads(leads, searchTerm) : leads;
      const groupedLeads = groupLeadsByStatus(filteredLeads);

      console.log("Grouped Leads:", groupedLeads); // ✅ Check data format

      // ✅ Ensure we set an array
      setLeads(Array.isArray(groupedLeads) ? groupedLeads : []);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast.error(error.message || "Failed to fetch leads. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [filters]);

  const filterLeads = (leads, term) => {
    const searchLower = term.toLowerCase();
    return leads.filter((lead) => {
      return (
        // Contact info
        lead.contact?.name?.toLowerCase().includes(searchLower) ||
        lead.contact?.email?.toLowerCase().includes(searchLower) ||
        lead.contact?.phoneNo?.toLowerCase().includes(searchLower) ||
        // Reference info
        lead.reference?.name?.toLowerCase().includes(searchLower) ||
        lead.reference?.email?.toLowerCase().includes(searchLower) ||
        lead.reference?.phoneNo?.toLowerCase().includes(searchLower) ||
        // Other fields
        lead.status?.toLowerCase().includes(searchLower) ||
        lead.priority?.toLowerCase().includes(searchLower) ||
        lead.source?.name?.toLowerCase().includes(searchLower) ||
        lead.assignedTo?.user?.name?.toLowerCase().includes(searchLower) ||
        lead.remark?.toLowerCase().includes(searchLower)
      );
    });
  };

  const groupLeadsByStatus = (leadsData) => {
    const statusGroups = {
      New: {
        title: "New",
        leads: [],
        color: "bg-teal-100",
        border: "border-teal-300",
      },
      Contacted: {
        title: "Contacted",
        leads: [],
        color: "bg-yellow-100",
        border: "border-yellow-300",
      },
      Qualified: {
        title: "Qualified",
        leads: [],
        color: "bg-green-100",
        border: "border-green-300",
      },
      Converted: {
        title: "Converted",
        leads: [],
        color: "bg-purple-100",
        border: "border-purple-300",
      },
      Closed: {
        title: "Closed",
        leads: [],
        color: "bg-red-100",
        border: "border-red-300",
      },
    };

    leadsData.forEach((lead) => {
      if (statusGroups[lead.status]) {
        statusGroups[lead.status].leads.push(lead);
      }
    });

    return Object.values(statusGroups);
  };

  const handleAddFollowUp = async (leadId, data) => {
    try {
      const response = await addFollowUp(leadId, data);
      fetchLeads();
      if (viewLead && viewLead._id === leadId) {
        const updatedLeadResponse = await getLeadById(leadId);
        setViewLead(updatedLeadResponse.data);
      }
    } catch (error) {
      toast.error(error.message || "Error adding follow-up:");
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    try {
      const { draggableId, destination } = result;
      await changeLeadStatus(draggableId, destination.droppableId);

      // Refresh leads after status change
      const response = await getLeads(filters);
      const groupedLeads = groupLeadsByStatus(response.data);
      setLeads(groupedLeads);
    } catch (error) {
      toast.error(error.message || "Error updating lead status:");
    }
  };

  const renderKanbanView = () => (
    <DragDropContext onDragEnd={handleDragEnd}>
      {leads.length === 0 && (
        <div className="text-center py-8 text-gray-500">No leads Available</div>
      )}
      <div className="flex gap-2  p-4 h-[calc(100vh-200px)]">
        {leads.map((column) => (
          <Droppable key={column.title} droppableId={column.title}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`maincard flex flex-col h-[calc(100vh-105px)] w-60 overflow-y-auto justify-start ${column.color} rounded-lg p-1 border ${column.border}`}
              >
                <div
                  className={`flex justify-between items-center mb-4 p-2 ${
                    column.title === "New"
                      ? "bg-teal-300 "
                      : column.title === "Contacted"
                      ? "bg-yellow-300"
                      : column.title === "Converted"
                      ? "bg-purple-300"
                      : column.title === "Qualified"
                      ? "bg-green-300"
                      : "bg-red-300"
                  }`}
                >
                  <h3 className={` font-bold mb-2 flex justify-between`}>
                    {column.title}
                  </h3>
                  <span className="bg-white  px-2 py-2 rounded-full text-xs">
                    {column.leads.length}
                  </span>
                </div>
                <div className="space-y-2">
                  {column.leads.map((lead, index) => (
                    <Draggable
                      key={lead._id}
                      draggableId={lead._id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <LeadCard
                            lead={lead}
                            onLeadClick={() => setViewLead(lead)}
                            onEditClick={(lead) => {
                              setSelectedLead(lead);
                              setShowForm(true);
                            }}
                            onFollowUpClick={(lead) => {
                              setViewLead(lead);
                              setIsFollowUpModalOpen(true);
                            }}
                            onAssignClick={(lead) => {
                              setSelectedLead(lead);
                              setIsAssignModalOpen(true);
                            }}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );

  const renderTableView = () => (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <th className="px-4 py-2">Contact</th>
            <th className="px-4 py-2">Status</th>
            <th className="px-4 py-2">Assigned To</th>
            <th className="px-4 py-2">Source</th>
            <th className="px-4 py-2">Created</th>
            <th className="px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {leads
            .flatMap((column) => column.leads)
            .map((lead) => (
              <tr key={lead._id} className="text-xs">
                <td className="px-4 py-2 text-center">
                  <div className="font-medium">{lead.contact?.name}</div>
                  <div className="text-gray-500">{lead.contact?.phoneNo}</div>
                </td>
                <td className="px-4 py-2 text-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      lead.status === "New"
                        ? "bg-blue-100 text-blue-800"
                        : lead.status === "Contacted"
                        ? "bg-yellow-100 text-yellow-800"
                        : lead.status === "Qualified"
                        ? "bg-green-100 text-green-800"
                        : lead.status === "Converted"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-center">
                  {lead.assignedTo?.user?.name || "Unassigned"}
                </td>
                <td className="px-4 py-2 text-center">{lead.source?.name}</td>
                <td className="px-4 py-2 text-center">
                  {new Date(lead.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-2 text-center">
                  <div className="flex space-x-2 justify-center">
                    <button
                      onClick={() => setViewLead(lead)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </button>
                    <button
                      onClick={() => {
                        setSelectedLead(lead);
                        setShowForm(true);
                      }}
                      className="text-green-600 hover:text-green-800"
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {leads.length === 0 && (
        <div className="text-center py-8 text-gray-500">No leads Available</div>
      )}
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      <div className="px-6 py-4 bg-white border-b">
        <h1 className="text-xl font-semibold mb-4">Leads</h1>

        <div className="flex justify-between items-center">
          <div className=" items-center space-x-4">
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === "kanban"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 text-sm rounded ${
                  viewMode === "table"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                Table View
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search clients..."
              className="px-3 py-1 text-sm border rounded-md w-64"
              value={searchTerm}
              onChange={(e) => {
                const newSearchTerm = e.target.value;
                setSearchTerm(newSearchTerm);
                const filteredLeads = filterLeads(allLeads, newSearchTerm);
                const groupedLeads = groupLeadsByStatus(filteredLeads);
                setLeads(groupedLeads);
              }}
            />
          </div>
          <button
            onClick={() => setShowForm(true)}
            disabled={!(role === "CompanyAdmin" || leadsPermissions?.create)}
            className={`px-4 py-1 text-sm  rounded-md ${
              role === "CompanyAdmin" || leadsPermissions?.create
                ? "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            Add Lead
          </button>
        </div>
      </div>

      <div className="">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>
        ) : viewMode === "kanban" ? (
          renderKanbanView()
        ) : (
          renderTableView()
        )}
      </div>

      {showForm && (
        <LeadFormModal
          show={showForm}
          onClose={() => setShowForm(false)}
          onSubmit={async (formData) => {
            try {
              const response = await createLead(formData);
              fetchLeads();
            } catch (error) {
              console.log("error", error);
              toast.error("error", error);
            }
          }}
        />
      )}

      {selectedLead && (
        <LeadFormModal
          show={showForm}
          onClose={() => setShowForm(false)}
          isEdit={true}
          leadId={selectedLead?._id}
          onSubmit={async (formData, leadId) => {
            try {
              const response = await updateLead(leadId, formData);
              fetchLeads();
            } catch (error) {
              console.log("error", error);
            }
          }}
        />
      )}

      {viewLead && (
        <LeadDetailsModal
          lead={viewLead}
          onClose={() => setViewLead(null)}
          onAddFollowUp={handleAddFollowUp}
        />
      )}
    </div>
  );
};

export default Lead;
