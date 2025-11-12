const Holiday = require("../../models/holiday.model");


// Add a new holiday
exports.addHoliday = async (req, res) => {
    try {
        const { date, name } = req.body;
        if (!date || !name) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        if(await Holiday.findOne({date, company: req.user.company})){
            return res.status(400).json({ message: "holiday already exist." });
        }
        
        const holiday = new Holiday({ date, name, company: req.user.company });
        await holiday.save();
        
        res.status(201).json({ message: "Holiday added successfully", holiday });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update holiday
exports.updateHoliday = async (req, res) => {
    try {
        const { id } = req.params;
        const { date, name } = req.body;
        
        const holiday = await Holiday.findOne({_id: id, company: req.user.company});
        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found" });
        }

        if(date) holiday.date = date;
        if(name) holiday.name = name;

        await holiday.save()
        
        res.status(200).json({ message: "Holiday updated successfully", holiday });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get holidays by date range
exports.getHolidaysByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ message: "Start date and end date are required" });
        }
        
        const holidays = await Holiday.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) },
            company: req.user.company
        });
        
        res.status(200).json({ holidays });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete holiday
exports.deleteHoliday = async (req, res) => {
    try {
        const { id } = req.params;

        const holiday = await Holiday.findOne({_id: id, company: req.user.company});
        if (!holiday) {
            return res.status(404).json({ message: "Holiday not found" });
        }
        
        const deleteHoliday = await Holiday.findByIdAndDelete(id);
        
        res.status(200).json({ message: "Holiday deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
