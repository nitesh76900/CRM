const Company = require("../../models/company.model");


// Set Attendance By
exports.setAttendanceBy = async (req, res) => {
  try {
    const companyId = req.user.company;
    const { attendanceBy } = req.body;
    
    if (!['Self', 'AssignedEmp'].includes(attendanceBy)) {
      return res.status(400).json({ message: 'Invalid attendanceBy value' });
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { attendanceBy },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'AttendanceBy updated successfully', attendanceBy: company.attendanceBy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Attendance By
exports.getAttendanceBy = async (req, res) => {
  try {
    const companyId = req.user.company;
    const company = await Company.findById(companyId).select('attendanceBy');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ attendanceBy: company.attendanceBy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Set Attendance Check By
exports.setAttendanceCheckBy = async (req, res) => {
  try {
    const companyId = req.user.company;
    const { location, networkIp } = req.body;
    
    let updateFields = {};
    
    if (location && location.lat && location.long) {
      updateFields['attendanceCheckBy.location'] = {
        enable: true,
        value: { lat: location.lat, long: location.long }
      };
    }

    if (networkIp) {
      updateFields['attendanceCheckBy.networkIp'] = {
        enable: true,
        value: networkIp
      };
    }

    const company = await Company.findByIdAndUpdate(
      companyId,
      { $set: updateFields },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'AttendanceCheckBy updated successfully', attendanceCheckBy: company.attendanceCheckBy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get Attendance Check By
exports.getAttendanceCheckBy = async (req, res) => {
  try {
    const companyId = req.user.company;
    const company = await Company.findById(companyId).select('attendanceCheckBy');
    
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ attendanceCheckBy: company.attendanceCheckBy });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete Attendance Check By
exports.deleteAttendanceCheckBy = async (req, res) => {
    try {
        const companyId = req.user.company;
      const { location, networkIp } = req.body;
  
      let updateFields = {};
  
      if (location === false) {
        updateFields['attendanceCheckBy.location'] = {};
      }
  
      if (networkIp === false) {
        updateFields['attendanceCheckBy.networkIp'] = {};
      }
  
      const company = await Company.findByIdAndUpdate(
        companyId,
        { $unset: updateFields },
        { new: true }
      );
  
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      res.status(200).json({ message: 'AttendanceCheckBy deleted successfully', attendanceCheckBy: company.attendanceCheckBy });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };