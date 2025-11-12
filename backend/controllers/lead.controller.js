const Contacts = require("../models/contact.model");
const Employee = require("../models/employee.model");
const Lead = require("../models/lead.model");
const LeadFor = require("../models/leadFor.model");
const LeadSource = require("../models/leadSource.model");
const LeadStatusLabel = require("../models/leadStatusLabel.model");
const User = require("../models/user.model");

// ✅ Create a Lead
exports.createLead = async (req, res) => {
  try {
    console.log("req.body", req.body);
    const {title, leadForId, leadSourceId, contact, reference, remark, assignedTo } =
      req.body;

    if (!title || !leadForId || !leadSourceId || !contact) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const company = req.user.company;

    if (!(await LeadFor.findOne({ _id: leadForId, company, isActive: true })))
      return res.status(404).json({ message: "Lead For not found" });
    if (
      !(await LeadSource.findOne({
        _id: leadSourceId,
        company,
        isActive: true,
      }))
    )
      return res.status(404).json({ message: "Lead Source not found" });
    if (
      assignedTo &&
      !(await Employee.findOne({ _id: assignedTo, company, isActive: true }))
    )
      return res
        .status(404)
        .json({ message: "Assigned To Employee not found" });

    let companyId = null;

    let existingClientFindByEmail = await Contacts.findOne({
      company: req.user.company,
      email: contact.email,
    });
    let existingClientFindByPhoneNo = await Contacts.findOne({
      company: req.user.company,
      phoneNo: contact.phoneNo,
    });

    if (existingClientFindByEmail || existingClientFindByPhoneNo) {
      companyId = existingClientFindByEmail
        ? existingClientFindByEmail._id
        : existingClientFindByPhoneNo._id; // If exists, return ID
    } else {
      let newClient = new Contacts({
        company: req.user.company,
        name: contact.name,
        email: contact.email,
        phoneNo: contact.phoneNo,
      });

      await newClient.save(); // Save new client
      companyId = newClient._id; // Return new client's ID
    }

    const newLead = new Lead({
      title:title,
      for: leadForId,
      source: leadSourceId,
      contact: companyId,
      reference,
      remark,
      assignedTo,
      createdBy: req.user._id,
      company,
    });

    const savedLead = await newLead.save();
    return res
      .status(201)
      .json({ message: "Lead created successfully", data: savedLead });
  } catch (error) {
    console.error("Error creating lead:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Update a Lead
exports.updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      leadForId,
      leadSourceId,
      contact,
      reference,
      status,
      remark,
      assignedTo,
    } = req.body;
    const company = req.user.company;

    // 🔹 Check if lead exists
    const lead = await Lead.findOne({ _id: id, company });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // 🔹 Validate status
    if (
      status &&
      !["New", "Contacted", "Qualified", "Converted", "Closed"].includes(status)
    ) {
      return res.status(400).json({
        message:
          "status must be 'New', 'Contacted', 'Qualified', 'Converted', 'Closed'",
      });
    }

    // 🔹 Validate References if Provided
    if (
      leadForId &&
      !(await LeadFor.findOne({ _id: leadForId, company, isActive: true }))
    ) {
      return res.status(404).json({ message: "Lead For not found" });
    }
    if (
      leadSourceId &&
      !(await LeadSource.findOne({
        _id: leadSourceId,
        company,
        isActive: true,
      }))
    ) {
      return res.status(404).json({ message: "Lead Source not found" });
    }
    if (
      assignedTo &&
      !(await Employee.findOne({ _id: assignedTo, company, isActive: true }))
    ) {
      return res.status(404).json({ message: "Assigned Employee not found" });
    }

    let contactId = null;

    let existingClientFindByEmail = await Contacts.findOne({
      company: req.user.company,
      email: contact.email,
    });
    let existingClientFindByPhoneNo = await Contacts.findOne({
      company: req.user.company,
      phoneNo: contact.phoneNo,
    });

    if (existingClientFindByEmail || existingClientFindByPhoneNo) {
      contactId = existingClientFindByEmail
        ? existingClientFindByEmail._id
        : existingClientFindByPhoneNo._id; // If exists, return ID
    } else {
      let newClient = new Contacts({
        company: req.user.company,
        name: contact.name,
        email: contact.email,
        phoneNo: contact.phoneNo,
      });

      await newClient.save(); // Save new client
      contactId = newClient._id; // Return new client's ID
    }

    // 🔹 Update Lead Data
    lead.title = title || lead.title;
    lead.for = leadForId || lead.for;
    lead.source = leadSourceId || lead.source;
    lead.contact = contactId || lead.contact;
    lead.reference = reference || lead.reference;
    lead.status = status || lead.status;
    lead.remark = remark || lead.remark;
    lead.assignedTo = assignedTo || lead.assignedTo;

    await lead.save();

    return res
      .status(200)
      .json({ message: "Lead updated successfully", data: lead });
  } catch (error) {
    console.error("Error updating lead:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get All Leads (with optional filters)
exports.getLeads = async (req, res) => {
  try {
    const { search, status, assignedTo } = req.query;
    const company = req.user.company; // Get the company ID from the authenticated user

    let filter = { company }; // Ensure filtering by company

    // 🔹 Apply Filters
    if (status) {
      if (
        !["New", "Contacted", "Qualified", "Converted", "Closed"].includes(
          status
        )
      ) {
        return res.status(400).json({ message: "Invalid priority value" });
      }
      filter.status = status;
    }
    if (assignedTo) filter.assignedTo = assignedTo;

    // 🔹 Search by Contact Name or Reference Name
    if (search) {
      const contacts = await Contacts.find({
        name: { $regex: search, $options: "i" }, // Case-insensitive search
        company,
      }).select("_id");

      filter.$or = [
        { contact: { $in: contacts.map((c) => c._id) } },
        { "reference.name": { $regex: search, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate("for source contact createdBy")
      .populate({
        path: "assignedTo",
        populate: {
          path: "user", // Assuming "user" contains the name inside "assignedTo"
          select: "name", // Fetch only the "name" field
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Leads retrieved successfully",
      data: leads,
    });
  } catch (error) {
    console.error("Error fetching leads:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Get Lead by ID
exports.getLeadById = async (req, res) => {
  try {
    console.log("req.params", req.params);
    const { id } = req.params;

    const lead = await Lead.findById(id).populate(
      "contact assignedTo source for createdBy"
    );
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    if (String(lead.company) !== String(req.user.company)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this lead" });
    }

    return res
      .status(200)
      .json({ message: "Lead retrieved successfully", data: lead });
  } catch (error) {
    console.error("Error retrieving lead:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// ✅ Change Lead Status
exports.changeLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const company = req.user.company;

    if (
      !["New", "Contacted", "Qualified", "Converted", "Closed"].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid priority value" });
    }

    const lead = await Lead.findOne({ _id: id, company });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    lead.status = status;
    await lead.save();

    return res
      .status(200)
      .json({ message: "Lead status updated successfully", data: lead });
  } catch (error) {
    console.error("Error changing lead status:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.addFollowUp = async (req, res) => {
  try {
    const { id } = req.params; // Lead ID from URL
    const { conclusion } = req.body;

    if (!conclusion)
      return res
        .status(400)
        .json({ message: "Follow-up conclusion is required" });

    const lead = await Lead.findOne({ _id: id, company: req.user.company });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Ensure user has access to modify this lead
    if (String(lead.company) !== String(req.user.company)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to add follow-up to this lead" });
    }

    // Auto-generate sequence number
    const sequence = lead.followUps.length ? lead.followUps.length + 1 : 1;

    // Add follow-up
    lead.followUps.push({ sequence, conclusion });
    await lead.save();

    return res
      .status(200)
      .json({ message: "Follow-up added successfully", data: lead });
  } catch (error) {
    console.error("Error adding follow-up:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.updateFollowUp = async (req, res) => {
  try {
    const { id, followUpId } = req.params; // Lead ID & Follow-up ID from URL
    const { conclusion } = req.body;

    if (!conclusion)
      return res
        .status(400)
        .json({ message: "Follow-up conclusion is required" });

    const lead = await Lead.findOne({ _id: id, company: req.user.company });
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    // Ensure user has access to modify this lead
    if (String(lead.company) !== String(req.user.company)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to modify this lead" });
    }

    // 🔄 **Find & Update Existing Follow-up**
    const followUp = lead.followUps.find((f) => String(f._id) === followUpId);
    if (!followUp)
      return res.status(404).json({ message: "Follow-up not found" });

    followUp.conclusion = conclusion;

    await lead.save();
    return res
      .status(200)
      .json({ message: "Follow-up updated successfully", data: lead });
  } catch (error) {
    console.error("Error updating follow-up:", error);
    return res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
