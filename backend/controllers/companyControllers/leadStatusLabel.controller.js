const Lead = require("../../models/lead.model");
const LeadStatusLabel = require("../../models/leadStatusLabel.model");

// ✅ Add LeadSource
exports.addLeadStatusLabel = async (req, res) => {
  try {
    console.log('req.body', req.body)
    const { name } = req.body;
    console.log("name", name);
    if (!name)
      return res.status(400).json({ message: "All fields are required" });

    const newLeadStatusLabel = await LeadStatusLabel.create({
      name,
      company: req.user.company,
    });
    return res
      .status(201)
      .json({
        message: "Lead Status Label added successfully",
        data: newLeadStatusLabel,
      });
  } catch (error) {
    console.error("Add leadStatusLabel Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};

// ✅ Update LeadSource
exports.updateLeadStatusLabel = async (req, res) => {
  try {
    const { leadStatusLabelId } = req.params;
    const { name } = req.body;
    if (!name)
      return res.status(400).json({ message: "All fields are required" });

    const leadStatusLabel = await LeadStatusLabel.findOne({
      _id: leadStatusLabelId,
      company: req.user.company,
    });

    if (!leadStatusLabel)
      return res.status(404).json({ message: "leadStatusLabel not found" });

    leadStatusLabel.name = name;
    await leadStatusLabel.save();

    return res
      .status(200)
      .json({
        message: "leadStatusLabel updated successfully",
        data: leadStatusLabel,
      });
  } catch (error) {
    console.error("Update leadStatusLabel Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};


exports.deleteLeadStatusLabel = async (req, res) => {
    try {
        const { leadStatusLabelId } = req.params;

        const leadStatusLabel = await LeadStatusLabel.findOne({_id: leadStatusLabelId, company: req.user.company});

        if (!leadStatusLabel) return res.status(404).json({ message: "leadStatusLabel not found" });

        const leadWithDeleteStatusLabel = await Lead.find({status: leadStatusLabel._id})
        if(leadWithDeleteStatusLabel.length > 0){
            return res.status(400).json({ message: "leadStatusLabel use in lead" });
        }

        await LeadStatusLabel.findByIdAndDelete(leadStatusLabel._id)

        return res.status(200).json({ message: "leadStatusLabel delete successfully", data: leadStatusLabel });

    } catch (error) {
        console.error("Update leadStatusLabel Error:", error);
        return res.status(500).json({ message: "Server error", error });
    }
};

// ✅ Fetch All leadStatusLabel
exports.getAllLeadStatusLabel = async (req, res) => {
  try {
    const leadStatusLabel = await LeadStatusLabel.find({
      company: req.user.company,
    }).populate("company", "name");

    return res
      .status(200)
      .json({
        message: "leadStatusLabel fetched successfully",
        data: leadStatusLabel,
      });
  } catch (error) {
    console.error("Fetch leadStatusLabel Error:", error);
    return res.status(500).json({ message: "Server error", error });
  }
};
