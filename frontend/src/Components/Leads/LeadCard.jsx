import React from "react";
import { useState, useEffect } from "react";
import {
  Edit2,
  MessageCircle,
  Plus,
  Phone,
  Mail,
  User,
  Calendar,
  UserPlus,
  FileText,
} from "lucide-react";
import { BiSolidNetworkChart } from "react-icons/bi";
import authServices from "../../services/authServices";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";

const LeadCard = ({
  lead,
  onLeadClick,
  onEditClick,
  onFollowUpClick,
  onAssignClick,
}) => {
  const user = useSelector(selectUser);
  const [role, setRole] = useState("");
  const [leadsPermissions, setLeadsPermissions] = useState(null);

  useEffect(() => {
    if (user && user?.company) {
      setRole("Employee");
      // console.log("user.role.permissions", user.role.permissions.leads);
      setLeadsPermissions(user.role.permissions.leads);
    } else if (user.employees) {
      setRole("CompanyAdmin");
    } else if (user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  }, [user]);

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4 border border-gray-100">
      {/* Header: Status + Actions */}
      <div className="flex justify-between items-start mb-3">
        <div
          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
            lead.status
          )}`}
        >
          <span>{lead.for?.name || "N/A"}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditClick(lead);
            }}
            disabled={!(role === "CompanyAdmin" || leadsPermissions?.update)}
            className={`p-1.5  rounded-full ${
              role === "CompanyAdmin" || leadsPermissions?.update
                ? "text-blue-500  cursor-pointer hover:bg-gray-100 transition-colors"
                : " text-gray-500 cursor-not-allowed"
            }`}
            title="Edit Lead"
          >
            <Edit2 size={16} className="text-gray-600" />
          </button>
          {/* <button
            onClick={(e) => {
              e.stopPropagation();
              onAssignClick && onAssignClick(lead);
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Assign Lead"
          >
            <UserPlus size={16} className="text-gray-600" />
          </button> */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLeadClick(lead); // Open the details modal
              onFollowUpClick && onFollowUpClick(lead); // This will now be used to set showFollowUpForm
            }}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
            title="Add Follow-up"
          >
            {lead.followUps?.length > 0 ? (
              <BiSolidNetworkChart size={16} className="text-blue-600" />
            ) : (
              <Plus size={16} className="text-gray-600" />
            )}
          </button>
        </div>
      </div>

      {/* Lead Details */}
      <div className="cursor-pointer" onClick={() => onLeadClick(lead)}>
        <div className="mb-3">
          <h3 className="font-medium text-gray-900">
            {lead.title || "No Title"}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <User size={14} />
            <span>Contact Name: {lead.contact?.name || "N/A"}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
            <Phone size={14} />
            <span>{lead.contact?.phoneNo || "No Phone Number"}</span>
          </div>
          {lead.contact?.email && (
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <Mail size={14} />
              <span>{lead.contact?.email}</span>
            </div>
          )}
        </div>

        {/* Additional Lead Info */}
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-gray-600">
            <FileText size={14} />
            <span>Source: {lead.source?.name || "N/A"}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <User size={14} />
            <span>Created by: {lead.createdBy?.name || "Unknown"}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <User size={14} />
            <span>
              Assigned to: {lead?.assignedTo?.user?.name || "Not Assigned"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar size={14} />
            <span>Created on: {formatDate(lead.createdAt)}</span>
          </div>
        </div>

        {/* Follow-ups */}
        {lead.followUps?.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <MessageCircle size={14} />
              <span>{lead.followUps.length} Follow-ups</span>
            </div>
            {/* <ul className="mt-1 text-sm text-gray-600">
              {lead.followUps.map((followUp, index) => (
                <li key={followUp._id} className="flex items-center gap-2">
                  <Calendar size={12} />
                  {formatDate(followUp.date)} - {followUp.conclusion}
                </li>
              ))}
            </ul> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadCard;
