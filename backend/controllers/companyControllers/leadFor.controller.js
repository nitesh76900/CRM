const LeadFor = require("../../models/leadFor.model");

// ✅ Add LeadFor
exports.addLeadFor = async (req, res) => {
    try {
        const { name } = req.body;
        if(!name) return res.status(400).json({ message: "All fields are required" });

        const newLeadFor = await LeadFor.create({ name, company: req.user.company });
        return res.status(201).json({ message: "LeadFor added successfully", data: newLeadFor });

    } catch (error) {
        console.error("Add LeadFor Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Update LeadFor
exports.updateLeadFor = async (req, res) => {
    try {
        const { leadForId } = req.params;
        const { name } = req.body;
        if(!name) return res.status(400).json({ message: "All fields are required" });

        const leadFor = await LeadFor.findOne({_id: leadForId, company: req.user.company,});

        if (!leadFor) return res.status(404).json({ message: "LeadFor not found" });
        if(!leadFor.isActive) return res.status(404).json({ success: false, message: "LeadFor is not active" });

        leadFor.name = name
        await leadFor.save()

        return res.status(200).json({ message: "LeadFor updated successfully", data: leadFor });

    } catch (error) {
        console.error("Update LeadFor Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Delete LeadFor
exports.toggleActiveLeadFor = async (req, res) => {
    try {
        const { leadForId } = req.params;
        const leadFor = await LeadFor.findOne({_id: leadForId, company: req.user.company});

        if (!leadFor) return res.status(404).json({ message: "LeadFor not found" });

        leadFor.isActive = !leadFor.isActive
        await leadFor.save()

        return res.status(200).json({ message: `LeadFor ${(leadFor.isActive)? "Active":"Inactive"} successfully` });

    } catch (error) {
        console.error("Delete LeadFor Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch Active LeadFor
exports.getActiveLeadFor = async (req, res) => {
    try {
        const leadForList = await LeadFor.find({company: req.user.company, isActive: true}).populate("company", "name");

        return res.status(200).json({ message: "LeadFor fetched successfully", data: leadForList });

    } catch (error) {
        console.error("Fetch LeadFor Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch All LeadFor
exports.getAllLeadFor = async (req, res) => {
    try {
        const leadForList = await LeadFor.find({company: req.user.company}).populate("company", "name");

        return res.status(200).json({ message: "LeadFor fetched successfully", data: leadForList });

    } catch (error) {
        console.error("Fetch LeadFor Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};