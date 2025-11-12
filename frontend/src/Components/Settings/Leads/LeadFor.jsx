import React, { useState, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import LeadForServices from "../../../services/LeadForServices";

export default function LeadPage() {
  const [leads, setLeads] = useState([]);
  const [open, setOpen] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [newLead, setNewLead] = useState({ name: "" });
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true)
  const leadsPerPage = 10;

  useEffect(() => {
    fetchAllLeads();
  }, []);

  const fetchAllLeads = async () => {
    try {
      const data = await LeadForServices.getAllLeadFors();
      setLeads(data.data);
    } catch (error) {
      toast.error("Failed to fetch Label's", error);
    }finally{
      setLoading(false)
    }
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditLead(null);
    setNewLead({ name: "" });
  };

  const handleChange = (e) => {
    setNewLead({ ...newLead, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editLead) {
        await LeadForServices.updateLeadFor(editLead._id, newLead);
        toast.success("Label updated successfully!");
      } else {
        await LeadForServices.addLeadFor(newLead);
        toast.success("label added successfully!");
      }
      await fetchAllLeads();
      handleClose();
    } catch (error) {
      toast.error("Failed to add/update label:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStatus = async (leadId) => {
    try {
      await LeadForServices.toggleActiveLeadFor(leadId);
      fetchAllLeads();
      toast.success("Successfully change the label status")
    } catch (error) {
      toast.error("Failed to toggle status:", error);
    }
  };

  const handleEdit = (lead) => {
    if (!lead.isActive) {
      toast.error("Inactive leads cannot be edited.");
      return;
    }
    setEditLead(lead);
    setNewLead({ name: lead.name });
    setOpen(true);
  };

  const filteredLeads = leads.filter((lead) =>
    lead.name.toLowerCase().includes(search.toLowerCase())
  );
  const indexOfLastLead = currentPage * leadsPerPage;
  const indexOfFirstLead = indexOfLastLead - leadsPerPage;
  const currentLeads = filteredLeads.slice(indexOfFirstLead, indexOfLastLead);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <>
      <ToastContainer position="top-center" style={{marginTop:"50px"}} autoClose={3000} />

      <div className="p-5 bg-white rounded-xl">
        <div className="flex justify-between mb-10">
          <h2 className="text-2xl font-bold">All Labels</h2>
          <input
            type="text"
            placeholder="Search label's...."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-xl border p-2 rounded"
          />
          <button
            onClick={handleOpen}
            className="bg-blue-500 text-white px-4 rounded"
          >
            Add Label
          </button>
        </div>
 
        {loading ? (
          <td colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </td> ):(
        <table className="w-full border-collapse mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2">Label</th>
              <th className="p-2">Status</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {currentLeads.length > 0 ? (
              currentLeads.map((lead) => (
                <tr key={lead._id} className="text-center hover:bg-gray-200">
                  <td className="p-2">{lead.name}</td>
                  <td className="p-2">
                    <div
                      className={`w-[70px] rounded-md p-1 mx-auto ${
                        lead.isActive
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {lead.isActive ? "Active" : "Inactive"}
                    </div>
                  </td>
                  <td className="p-2 flex justify-center space-x-3">
                    <button
                      onClick={() => handleEdit(lead)}
                      className="text-blue-500"
                    >
                      <FaEdit />
                    </button>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={lead.isActive}
                        onChange={() => toggleStatus(lead._id)}
                        className="sr-only peer"
                      />
                      <div className="relative w-11 h-6 bg-gray-300 rounded-full transition-all duration-300 peer-checked:bg-blue-600">
                        <div
                          className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all duration-300"
                          style={{
                            transform: lead.isActive
                              ? "translateX(20px)"
                              : "translateX(0px)",
                          }}
                        ></div>
                      </div>
                    </label>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center">
                  No label found.
                </td>
              </tr>
            )}
          </tbody>
        </table>)}

        <div className="flex justify-center mt-4 space-x-2">
          {Array.from(
            { length: Math.ceil(filteredLeads.length / leadsPerPage) },
            (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200"
                }`}
              >
                {i + 1}
              </button>
            )
          )}
        </div>

        {open && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500/40">
            <div className="bg-white p-5 rounded-xl shadow-lg w-96">
              <h3 className="text-xl font-semibold mb-4">
                {editLead ? "Edit label" : "Add New label"}
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="name"
                  placeholder="label Name"
                  value={newLead.name}
                  onChange={handleChange}
                  className="w-full border p-2 mb-3 rounded"
                  required
                  disabled={isSubmitting}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="bg-gray-300 px-4 py-2 rounded"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-500 text-white px-4 py-2 rounded disabled:bg-green-300"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (editLead ? "Updating..." : "Submitting...") 
                      : (editLead ? "Update" : "Submit")}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}