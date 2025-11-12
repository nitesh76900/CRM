const LeadSource = require("../../models/leadSource.model");

// ✅ Add LeadSource
exports.addLeadSource = async (req, res) => {
    try {
        const { name } = req.body;
        if(!name) return res.status(400).json({ message: "All fields are required" });

        const newLeadSource = await LeadSource.create({ name, company: req.user.company });
        return res.status(201).json({ message: "LeadSource added successfully", data: newLeadSource });

    } catch (error) {
        console.error("Add LeadSource Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update LeadSource
exports.updateLeadSource = async (req, res) => {
    try {
        const { leadSourceId } = req.params;
        const { name } = req.body;
        if(!name) return res.status(400).json({ message: "All fields are required" });

        const leadSource = await LeadSource.findOne({_id: leadSourceId, company: req.user.company});

        if (!leadSource) return res.status(404).json({ message: "LeadSource not found" });
        if(!leadSource.isActive) return res.status(404).json({ success: false, message: "leadSource is not active" });

        leadSource.name = name
        await leadSource.save()

        return res.status(200).json({ message: "LeadSource updated successfully", data: leadSource });

    } catch (error) {
        console.error("Update LeadSource Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Delete LeadSource
exports.toggleActiveLeadSource = async (req, res) => {
    try {
        const { leadSourceId } = req.params;
        const leadSource = await LeadSource.findOne({_id: leadSourceId, company: req.user.company});

        if (!leadSource) return res.status(404).json({ message: "LeadSource not found" });

        leadSource.isActive = !leadSource.isActive
        await leadSource.save()

        return res.status(200).json({ message: `LeadSource ${(leadSource.isActive)? "Active":"Inactive"} successfully` });

    } catch (error) {
        console.error("Delete LeadSource Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch Active LeadSource
exports.getActiveLeadSource = async (req, res) => {
    try {
        const leadSource = await LeadSource.find({company: req.user.company, isActive: true}).populate("company", "name");

        return res.status(200).json({ message: "LeadSource fetched successfully", data: leadSource });

    } catch (error) {
        console.error("Fetch LeadSource Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch All LeadSource
exports.getAllLeadSource = async (req, res) => {
    try {
        const leadSource = await LeadSource.find({company: req.user.company}).populate("company", "name");

        return res.status(200).json({ message: "LeadSource fetched successfully", data: leadSource });

    } catch (error) {
        console.error("Fetch LeadSource Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};