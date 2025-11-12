import React, { useState, useEffect, useMemo } from "react";
import contactServices from "../../services/contactServices";
import { ToastContainer, toast } from "react-toastify";

import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Globe,
  Edit2,
  X,
  Eye,
} from "lucide-react";

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
};

const Contacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isClient, setIsClient] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNo: "",
    address: {
      country: "",
      state: "",
      city: "",
      pincode: "",
    },
  });

  // const showAlert = (message, type) => {
  //   setAlert({ show: true, message, type });
  //   setTimeout(() => setAlert({ show: false, message: "", type: "" }), 3000);
  // };

  const fetchContacts = async () => {
    try {
      setLoading(true);
      const response = await contactServices.getContacts({
        search: searchTerm,
        isClient: isClient === "" ? undefined : isClient === "true",
        page: currentPage,
        limit: 10,
      });

      console.log(response);
      // Check if response is empty or contains no contacts
      if (!response?.contacts || response.contacts.length === 0) {
        // setA([]);
        setContacts([]); // ✅ Ensure `leads` is an array
        toast.warn("No Contact available");
        return;
      }

      // Set the data if available
      setContacts(response.contacts);

      setTotalPages(response.totalPages);
    } catch (error) {
      toast.error(error || "Failed to fetch contacts. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, [searchTerm, isClient, currentPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedContact) {
        await contactServices.updateContact(selectedContact._id, formData);
        toast.success("Contact updated successfully");
      } else {
        await contactServices.addContact(formData);
        toast.success("Contact added successfully");
      }
      setModalOpen(false);
      setSelectedContact(null);
      resetForm();
      fetchContacts();
    } catch (error) {
      toast.error(error.message || "Error saving contact", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleClient = async (id) => {
    try {
      await contactServices.toggleClientStatus(id);
      toast.success("Status updated successfully", "success");
      fetchContacts();
    } catch (error) {
      toast.error(error.message || "Error updating status", "error");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phoneNo: "",
      address: {
        country: "",
        state: "",
        city: "",
        pincode: "",
      },
    });
  };

  const handleEdit = (contact) => {
    console.log("contact", contact);
    setSelectedContact(contact);
    setFormData({
      name: contact.name,
      email: contact.email || "",
      phoneNo: contact.phoneNo,
      address: {
        country: contact.address?.country || "",
        state: contact.address?.state || "",
        city: contact.address?.city || "",
        pincode: contact.address?.pincode || "",
      },
    });
    setModalOpen(true);
  };

  const openDetailModal = (contact) => {
    setSelectedContact(contact);
    setDetailModalOpen(true);
  };

  const sortedContacts = useMemo(() => {
    return [...contacts].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />

      {/* Alert */}
      {/* {alert.show && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            alert.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {alert.message}
        </div>
      )} */}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
          <p className="text-gray-500 mt-1">Manage your contacts and clients</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setSelectedContact(null);
            setModalOpen(true);
          }}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          Add Contact
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <select
            value={isClient}
            onChange={(e) => setIsClient(e.target.value)}
            className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">All Contacts</option>
            <option value="true">Clients</option>
            <option value="false">Non-Clients</option>
          </select>
        </div>
      </div>

      {/* Contacts Table */}
      {loading ? (
        <div className="flex justify-center items-center h-16">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-full bg-white">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  S. No.
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Name
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Email
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Phone
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Type
                </th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[...contacts] // Create a shallow copy to avoid mutating the original array
                .sort((a, b) => a.name.localeCompare(b.name)) // Sort alphabetically by name
                .map((contact, index) => (
                  <tr
                    key={contact._id}
                    // onClick={() => openDetailModal(contact)}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-3 py-2 whitespace-nowrap">
                      {index+1}
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-600">
                        {contact.email}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone size={14} />
                        <span>{contact.phoneNo || "No phone"}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-2"
                      >
                        <ToggleSwitch
                          checked={contact.isClient}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleClient(contact._id);
                          }}
                        />
                        <span className="text-sm text-gray-600">
                          {contact.isClient ? "Client" : "Contact"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(contact);
                          }}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDetailModal(contact); // Trigger detail modal
                          }}
                          className="text-gray-400 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        >
                          <Eye size={16} /> {/* Eye icon for viewing details */}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
          {contacts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No contacts Available
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {detailModalOpen && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setDetailModalOpen(false);
                setSelectedContact(null);
              }}
              className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>

            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {selectedContact.name}
              </h2>
              {/* <img src={selectedContact.businessCard?.url} alt={selectedContact.name} /> */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    selectedContact.isClient
                      ? "bg-blue-100 text-blue-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {selectedContact.isClient ? "Client" : "Contact"}
                </span>
              </div>
            </div>

            {selectedContact.businessCard?.url && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Business Card
                </h3>
                <div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={selectedContact.businessCard.url}
                    alt="Business Card"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "/placeholder-image.png"; // Fallback image
                    }}
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Contact Information
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Mail className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-gray-800">{selectedContact.email}</p>
                        <p className="text-sm text-gray-500">Email</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-gray-800">
                          {selectedContact.phoneNo || "Not provided"}
                        </p>
                        <p className="text-sm text-gray-500">Phone</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Address Details
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <MapPin className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-gray-800">
                          {selectedContact.address?.city &&
                          selectedContact.address?.state ? (
                            <>
                              {selectedContact.address.city},{" "}
                              {selectedContact.address.state}
                            </>
                          ) : (
                            "Address not provided"
                          )}
                        </p>
                        <p className="text-sm text-gray-500">City & State</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="text-gray-400 mt-1" size={20} />
                      <div>
                        <p className="text-gray-800">
                          {selectedContact.address?.country || "Not provided"}
                        </p>
                        <p className="text-sm text-gray-500">Country</p>
                      </div>
                    </div>
                    {selectedContact.address?.pincode && (
                      <div className="flex items-start gap-3">
                        <MapPin className="text-gray-400 mt-1" size={20} />
                        <div>
                          <p className="text-gray-800">
                            {selectedContact.address.pincode}
                          </p>
                          <p className="text-sm text-gray-500">Pincode</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
              <button
                onClick={() => {
                  handleEdit(selectedContact);
                  setDetailModalOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Edit2 size={18} />
                Edit Contact
              </button>
              <button
                onClick={() => {
                  setDetailModalOpen(false);
                  setSelectedContact(null);
                }}
                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {contacts.length > 0 && (
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-gray-600">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-gray-300 disabled:opacity-50"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-gray-500/40 bg-opacity-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {selectedContact ? "Update Contact" : "Add Contact"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.phoneNo}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNo: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, city: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={formData.address.state}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, state: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Country"
                  value={formData.address.country}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, country: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="Pincode"
                  value={formData.address.pincode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      address: { ...formData.address, pincode: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <input
                type="file"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    businessCard: e.target.files[0],
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                accept="image/*"
              />
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setModalOpen(false);
                    setSelectedContact(null);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                >
                  {isSubmitting
                    ? selectedContact
                      ? "Updating..."
                      : "Adding..."
                    : selectedContact
                    ? "Update"
                    : "Add"}{" "}
                  Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contacts;
