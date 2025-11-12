const Attendance = require("../../models/attendance.model");
const Company = require("../../models/company.model");
const Employee = require("../../models/employee.model");
const Holiday = require("../../models/holiday.model");

const getIndianTodayDate = () => {
    // Get current date in UTC
    const now = new Date();

    // Convert to IST (UTC +5:30)
    now.setUTCHours(2, 30, 0, 0); // 8:00 AM IST is 2:30 AM UTC
    return now;
};

const isIdPresent = (id, idArray) => {
    return idArray.some((objId) => objId.toString() === id.toString());
};

exports.getTodayAttendances = async (req, res) => {
    try {
        const companyId = req.user.company;
        if (!companyId) {
            return res.status(400).json({ success: false, message: "Company ID is required" });
        }

        // Get today's date in IST (yyyy-MM-dd)
        const today = getIndianTodayDate();

        const holidayDate = new Date();
        holidayDate.setUTCHours(0, 0, 0, 0);

        // Check if today is a holiday
        const holiday = await Holiday.findOne({ company: companyId, date: holidayDate });

        // Fetch all active and verified employees
        const employees = await Employee.find(
            { company: companyId, isActive: true, verify: "Verify" },
            "_id"
        );

        if (employees.length === 0) {
            return res.status(404).json({ success: false, message: "No employees found for this company" });
        }

        // Fetch today's attendance records
        const todayAttendances = await Attendance.find({
            company: companyId,
            date: today,
        }).populate({
            path: "employeeId",
            populate: {
                path: "user",
                model: "User",
            },
        });

        // Map existing attendance by employeeId for quick lookup (ensure string comparison)
        const attendanceMap = todayAttendances.map((att) => att.employeeId._id);

        console.log(attendanceMap)

        // Create missing attendance records
        const newAttendances = employees
            .filter((emp) => !isIdPresent(emp._id, attendanceMap))
            .map((emp) => ({
                employeeId: emp._id,
                date: today,
                status: holiday ? "Holiday" : "Pending",
                holidayName: holiday ? holiday.name : null,
                company: companyId,
            }));

        console.log(newAttendances)

        if (newAttendances.length > 0) {
            await Attendance.insertMany(newAttendances);
        }

        // Re-fetch updated attendance records
        const updatedAttendances = await Attendance.find({
            company: companyId,
            date: today,
        }).populate({
            path: "employeeId",
            populate: {
                path: "user",
                model: "User",
            },
        });

        res.status(200).json({
            success: true,
            message: holiday ? `Today is a holiday: ${holiday.name}` : "Today's attendance records",
            attendances: updatedAttendances,
        });

    } catch (error) {
        console.error("Error fetching today's attendances:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};



exports.getAttendanceByDate = async (req, res) => {
    try {
        const { date } = req.params;
        const companyId = req.user.company;

        if (!date) {
            return res
                .status(400)
                .json({ success: false, message: "Date is required" });
        }

        // Convert date to IST (yyyy-MM-dd)
        const selectedDate = new Date(date);
        const startDateTime = new Date(selectedDate.setHours(0, 0, 0, 0));
        const endDateTime = new Date(selectedDate.setHours(23, 59, 59, 999));

        // Get today's date in IST
        const todayIST = getIndianTodayDate();

        // Check if the selected date is in the future
        if (selectedDate > todayIST.setHours(23, 59, 59, 999)) {
            return res
                .status(400)
                .json({ success: false, message: "Future dates are not allowed" });
        }

        // Check if the date is a holiday
        const holiday = await Holiday.findOne({
            company: companyId,
            date: selectedDate,
        });
        if (holiday) {
            return res.status(200).json({
                success: true,
                message: `It is a holiday: ${holiday.name}`,
                isHoliday: true,
            });
        }

        // Fetch attendance records for the given date
        const attendances = await Attendance.find({
            company: companyId,
            date: { $gte: startDateTime, $lte: endDateTime },
        }).populate({
            path: "employeeId", // First, populate the employee field
            populate: {
                path: "user", // Then, populate the user field inside employee
                model: "User", // Ensure the correct model name
            },
        });

        if (attendances.length === 0) {
            return res.status(200).json({
                message: "No attendance recorded for this date",
                isHoliday: false,
            });
        }

        res.status(200).json({ success: true, attendances });
    } catch (error) {
        console.error("Error fetching attendance by date:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.getEmployeeAttendanceByDateRange = async (req, res) => {
    try {
        console.log("called", req.query);
        const { employeeId } = req.params;
        const { fromDate, toDate } = req.query;
        const companyId = req.user.company;

        if (!employeeId || !fromDate || !toDate) {
            return res
                .status(400)
                .json({
                    success: false,
                    message: "Employee ID, fromDate, and toDate are required",
                });
        }

        const employee = await Employee.findOne({
            _id: employeeId,
            company: companyId,
            isActive: true,
            verify: "Verify"
        }).populate("user");

        if (!employee) {
            return res
                .status(400)
                .json({ success: false, message: "Employee not found." });
        }

        // Convert dates to proper format (IST) and validate
        const from = new Date(fromDate);
        const to = new Date(toDate);
        const today = getIndianTodayDate();

        const startDateTime = new Date(from.setUTCHours(1, 30, 0, 0));
        const endDateTime = new Date(to.setUTCHours(2, 30, 0, 0));
        // today.setHours(0, 0, 0, 0); // Remove time to compare only dates

        console.log(startDateTime, endDateTime, today);

        // Validate date range
        if (isNaN(startDateTime) || isNaN(endDateTime)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid date format" });
        }
        if (startDateTime > today || endDateTime > today) {
            return res
                .status(400)
                .json({ success: false, message: "Future dates are not allowed" });
        }
        if (endDateTime < startDateTime) {
            return res
                .status(400)
                .json({ success: false, message: "toDate cannot be before from Date" });
        }

        // Fetch attendance records for the given employee in the date range
        const attendances = await Attendance.find({
            employeeId,
            company: companyId,
            date: { $gte: startDateTime, $lte: endDateTime },
        });

        if (attendances.length === 0) {
            return res
                .status(404)
                .json({
                    success: false,
                    message: "No attendance records found for the given date range",
                });
        }

        res.status(200).json({ success: true, attendances, employee });
    } catch (error) {
        console.error("Error fetching attendance by date range:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

const getUTCFromIndianTime = (indianDate) => {
    // Parse the Indian date (in "YYYY-MM-DD" format)
    const [year, month, day] = indianDate.split("-").map(Number);

    // Create a Date object in IST (UTC +5:30)
    const istDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

    // Convert to UTC (automatically handled by Date object in ISO format)
    return istDate.toISOString();
};

const convertToUTC = (localDateTime) => {
    // Create a Date object from the input
    const localDate = new Date(localDateTime);

    // Validate the date
    if (isNaN(localDate.getTime())) {
        throw new Error(
            "Invalid date format. Use a valid date string or timestamp."
        );
    }

    return localDate.toISOString();
};

const isSameDay = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);

    return (
        d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate()
    );
};

exports.markAttendanceByAdmin = async (req, res) => {
    try {
        console.log("Received Request Body:", req.body);
        const {
            employeeId,
            date,
            checkIn,
            checkOut,
            isManualEntry,
            status,
            leaveType,
        } = req.body;
        const companyId = req.user.company;

        if (!employeeId || !date) {
            return res
                .status(400)
                .json({ message: "Employee ID and date are required." });
        }
        if (isManualEntry === undefined) {
            return res.status(400).json({ message: "isManualEntry is required." });
        }

        console.log(date);

        const formattedDate = date;

        console.log(formattedDate);

        if (checkIn && !isSameDay(formattedDate, convertToUTC(checkIn))) {
            return res
                .status(404)
                .json({ message: "Check-In time are not same date." });
        }

        if (checkOut && !isSameDay(formattedDate, convertToUTC(checkOut))) {
            return res
                .status(404)
                .json({ message: "Check-Out time are not same date." });
        }

        // Check if the employee exists
        const employee = await Employee.findOne({
            _id: employeeId,
            company: companyId,
            isActive: true,
            verify: "Verify"
        }).populate("user");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        const holidayDate = new Date(formattedDate);
        holidayDate.setUTCHours(0, 0, 0, 0);

        // Check if the date is a holiday
        const holiday = await Holiday.findOne({
            date: holidayDate,
            company: companyId,
        });

        // Check if attendance already exists
        let attendance = await Attendance.findOne({
            employeeId,
            date: formattedDate,
            company: companyId,
        });

        if (!attendance) {
            // Create new attendance
            attendance = new Attendance({
                employeeId,
                date: formattedDate,
                company: companyId,
            });
        }

        switch (status) {
            case "Absent":
                attendance.status = "Absent";
                attendance.checkIn = null;
                attendance.checkOut = null;
                attendance.workHours = null;
                break;
            case "Half-Day":
                // Update check-in and check-out times for "Half-Day" status
                attendance.status = "Half-Day";
                if (!attendance.checkIn && !checkIn)
                    return res
                        .status(400)
                        .json({ message: "CheckIn time are required." });
                if (checkIn) attendance.checkIn = checkIn;
                if (checkOut) {
                    if (!attendance.checkIn) {
                        return res
                            .status(400)
                            .json({ message: "Check-in time is required before check-out." });
                    }
                    attendance.checkOut = checkOut;
                    const checkInTime = new Date(attendance.checkIn);
                    const checkOutTime = new Date(checkOut);
                    attendance.workHours =
                        (checkOutTime - checkInTime) / (1000 * 60 * 60);
                    if (checkInTime >= checkOutTime || attendance.workHours <= 0) {
                        return res
                            .status(400)
                            .json({ message: "Check-out time is not before check-in." });
                    }
                }
                break;
            case "Remote":
                // Update check-in and check-out times for "Remote" status
                attendance.status = "Remote";
                if (!attendance.checkIn && !checkIn)
                    return res
                        .status(400)
                        .json({ message: "CheckIn time are required." });
                if (checkIn) attendance.checkIn = checkIn;
                if (checkOut) {
                    if (!attendance.checkIn) {
                        return res
                            .status(400)
                            .json({ message: "Check-in time is required before check-out." });
                    }
                    attendance.checkOut = checkOut;
                    const checkInTime = new Date(attendance.checkIn);
                    const checkOutTime = new Date(checkOut);
                    attendance.workHours =
                        (checkOutTime - checkInTime) / (1000 * 60 * 60);
                    if (checkInTime >= checkOutTime || attendance.workHours <= 0) {
                        return res
                            .status(400)
                            .json({ message: "Check-out time is not before check-in." });
                    }
                }
                break;
            case "Leave":
                if (!leaveType) {
                    return res
                        .status(400)
                        .json({ message: "Leave type is required for Leave status." });
                }
                attendance.status = "Leave";
                attendance.leaveType = leaveType;
                attendance.checkIn = null;
                attendance.checkOut = null;
                attendance.workHours = null;

                break;
            case "Holiday":
                if (holiday) {
                    attendance.status = "Holiday";
                    attendance.holidayName = holiday.name;
                    attendance.recordedBy = req.user._id;
                    attendance.checkIn = null;
                    attendance.checkOut = null;
                    attendance.workHours = null;
                } else {
                    return res
                        .status(400)
                        .json({ message: "Not Holiday in provide date" });
                }
            default:
                // Update check-in and check-out times for "Present" status
                attendance.status = "Present";
                if (!attendance.checkIn && !checkIn)
                    return res
                        .status(400)
                        .json({ message: "CheckIn time are required." });
                if (checkIn) attendance.checkIn = checkIn;
                if (checkOut) {
                    if (!attendance.checkIn) {
                        return res
                            .status(400)
                            .json({ message: "Check-in time is required before check-out." });
                    }
                    attendance.checkOut = checkOut;
                    const checkInTime = new Date(attendance.checkIn);
                    const checkOutTime = new Date(checkOut);
                    attendance.workHours =
                        (checkOutTime - checkInTime) / (1000 * 60 * 60);
                    if (checkInTime >= checkOutTime || attendance.workHours <= 0) {
                        return res
                            .status(400)
                            .json({ message: "Check-out time is not before check-in." });
                    }
                }
                break;
        }

        attendance.isManualEntry = isManualEntry;
        attendance.recordedBy = req.user._id;

        await attendance.save();

        res
            .status(200)
            .json({
                message: "Attendance recorded successfully.",
                attendance,
                employee,
            });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Internal server error." });
    }
};

const getDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371e3; // Earth radius in meters
    const φ1 = toRad(lat1);
    const φ2 = toRad(lat2);
    const Δφ = toRad(lat2 - lat1);
    const Δλ = toRad(lon2 - lon1);

    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const getUtcDateTime = () => {
    return new Date(); // Returns current UTC time
};

const isTodayIndianTime = (date) => {
    const today = getUtcDateTime().toISOString().split("T")[0];
    const providedDate = new Date(date).toISOString().split("T")[0];
    return today === providedDate;
};

exports.markAttendanceByAssignEmpCheckIn = async (req, res) => {
    try {
        console.log("req.body", req.body);
        const { employeeId, location, networkIp, checkIn, status, leaveType } =
            req.body;
        const user = req.user; // Logged-in user

        const date = getIndianTodayDate();

        // Validate input
        if (!employeeId) {
            return res.status(400).json({ message: "Employee ID is required." });
        }

        if (checkIn && !isTodayIndianTime(checkIn)) {
            return res
                .status(400)
                .json({ message: "Provided check-in time is not today's date." });
        }

        // Ensure employee belongs to a company
        const company = await Company.findById(user.company).select(
            "attendanceCheckBy"
        );
        if (!company)
            return res.status(404).json({ message: "Company not found." });

        // Check if the employee exists
        const employee = await Employee.findOne({
            _id: employeeId,
            company: company._id,
            isActive: true,
            verify: "Verify"
        }).populate("user");
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        // Check location and network IP if enabled
        if (company.attendanceCheckBy?.location?.enable) {
            const { lat, long } = company.attendanceCheckBy.location.value;
            if (!location || !location.lat || !location.long) {
                return res
                    .status(400)
                    .json({ message: "Location are required. Attendance not allowed." });
            }
            const distance = getDistance(location.lat, location.long, lat, long);
            if (distance > 500) {
                return res
                    .status(403)
                    .json({ message: "Location mismatch. Attendance not allowed." });
            }
        }

        if (company.attendanceCheckBy?.networkIp?.enable) {
            if (networkIp !== company.attendanceCheckBy.networkIp.value) {
                return res
                    .status(403)
                    .json({ message: "Network IP mismatch. Attendance not allowed." });
            }
        }

        const holidayDate = new Date();
        holidayDate.setUTCHours(0, 0, 0, 0);

        // Check if date is a holiday
        const holiday = await Holiday.findOne({
            date: holidayDate,
            company: company._id,
        });

        let checkInTime = checkIn || getUtcDateTime();
        const manualEntry = !!checkIn;

        checkInTime = convertToUTC(checkInTime);

        if (!holiday && !checkInTime) {
            return res.status(400).json({ message: "Check-in time is required." });
        }

        // Check if attendance already exists
        let attendance = await Attendance.findOne({
            employeeId,
            date,
            company: company._id,
        });

        if (attendance) {
            if (holiday) {
                attendance.status = "Holiday";
                attendance.holidayName = holiday.name;
            }
            if (attendance.status && attendance.status !== "Pending") {
                return res.status(400).json({ message: "Attendance already marked." });
            }
        } else {
            attendance = new Attendance({ employeeId, date, company: company._id });

            if (holiday) {
                attendance.status = "Holiday";
                attendance.holidayName = holiday.name;
            }
        }

        if (!holiday) {
            // Handle specific attendance statuses
            switch (status) {
                case "Absent":
                    attendance.status = "Absent";
                    break;
                case "Half-Day":
                    attendance.status = "Half-Day";
                    attendance.checkIn = checkIn;
                    break;
                case "Remote":
                    attendance.status = "Remote";
                    attendance.checkIn = checkIn;
                    break;
                case "Leave":
                    if (!leaveType) {
                        return res
                            .status(400)
                            .json({ message: "Leave type is required for Leave status." });
                    }
                    attendance.status = "Leave";
                    attendance.leaveType = leaveType;
                    break;
                default:
                    // Update check-in times for "Present" status
                    attendance.checkIn = checkIn;
                    attendance.status = "Present";
                    break;
            }
        }

        attendance.isManualEntry = manualEntry;
        attendance.recordedBy = req.user._id;

        await attendance.save();
        res
            .status(200)
            .json({
                message: "Attendance recorded successfully.",
                attendance,
                employee,
            });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

exports.markAttendanceByAssignEmpCheckOut = async (req, res) => {
    try {
        const { attendanceId, checkOut, location, networkIp } = req.body;
        const user = req.user; // Logged-in user

        console.log(req.body);

        // Validate input
        if (!attendanceId) {
            return res.status(400).json({ message: "Attendance ID are required." });
        }

        const company = await Company.findById(user.company).select(
            "attendanceCheckBy"
        );
        if (!company)
            return res.status(404).json({ message: "Company not found." });

        // Check location and network IP if enabled
        if (company.attendanceCheckBy?.location?.enable) {
            const { lat, long } = company.attendanceCheckBy.location.value;
            if (!location || !location.lat || !location.long) {
                return res
                    .status(400)
                    .json({ message: "Location are required. Attendance not allowed." });
            }
            const distance = getDistance(location.lat, location.long, lat, long);
            if (distance > 500) {
                return res
                    .status(403)
                    .json({ message: "Location mismatch. Attendance not allowed." });
            }
        }

        if (company.attendanceCheckBy?.networkIp?.enable) {
            if (networkIp !== company.attendanceCheckBy.networkIp.value) {
                return res
                    .status(403)
                    .json({ message: "Network IP mismatch. Attendance not allowed." });
            }
        }

        const attendance = await Attendance.findById(attendanceId);
        if (!attendance || !attendance.checkIn) {
            return res
                .status(404)
                .json({ message: "Check-in not found. Cannot check-out." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Check-out already marked." });
        }

        let checkOutTime = checkOut || getUtcDateTime();
        const manualEntry = !!checkOut;

        checkOutTime = convertToUTC(checkOutTime);

        attendance.checkOut = new Date(checkOutTime);
        attendance.workHours =
            (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
        attendance.isManualEntry = manualEntry;

        if (
            attendance.checkIn >= checkOutTime ||
            (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60) <= 0
        ) {
            return res
                .status(400)
                .json({ message: "Check-out time is not before check-in." });
        }

        await attendance.save();
        res.status(200).json({ message: "Check-out successful.", attendance });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

exports.markAttendanceBySelfCheckIn = async (req, res) => {
    try {
        const { location, networkIp } = req.body;
        const user = req.user; // Logged-in employee

        const date = getIndianTodayDate();

        const company = await Company.findById(user.company).select(
            "attendanceBy attendanceCheckBy"
        );
        if (!company)
            return res.status(404).json({ message: "Company not found." });

        if (company.attendanceBy !== "Self") {
            return res
                .status(403)
                .json({
                    message:
                        "Self check-in not Open by admin and attendance assign employee.",
                });
        }

        const employee = await Employee.findOne({
            user: user._id,
            company: company._id,
            isActive: true,
            verify: "Verify"
        });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        if (company.attendanceCheckBy?.location?.enable) {
            const { lat, long } = company.attendanceCheckBy.location.value;
            if (!location || !location.lat || !location.long) {
                return res
                    .status(400)
                    .json({ message: "Location are required. Attendance not allowed." });
            }
            const distance = getDistance(location.lat, location.long, lat, long);
            console.log(location.lat, location.long);
            console.log(lat, long);
            console.log(distance);
            if (distance > 500) {
                return res
                    .status(403)
                    .json({ message: "Location mismatch. Attendance not allowed." });
            }
        }

        if (company.attendanceCheckBy?.networkIp?.enable) {
            if (networkIp !== company.attendanceCheckBy.networkIp.value) {
                return res
                    .status(403)
                    .json({ message: "Network IP mismatch. Attendance not allowed." });
            }
        }

        const holidayDate = new Date();
        holidayDate.setUTCHours(0, 0, 0, 0);

        const holiday = await Holiday.findOne({
            date: holidayDate,
            company: company._id,
        });

        let attendance = await Attendance.findOne({
            employeeId: employee._id,
            date,
            company: company._id,
        });

        if (!attendance) {
            attendance = new Attendance({
                employeeId: employee._id,
                date,
                company: company._id,
            });
        } else if (attendance.status && attendance.status !== "Pending") {
            return res.status(400).json({ message: "Attendance already marked." });
        }

        if (holiday) {
            attendance.status = "Holiday";
            attendance.holidayName = holiday.name;
        } else {
            attendance.status = "Present";
            attendance.checkIn = getUtcDateTime();
        }

        attendance.recordedBy = user._id;

        await attendance.save();
        res
            .status(200)
            .json({ message: "Attendance recorded successfully.", attendance });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

exports.markAttendanceBySelfCheckOut = async (req, res) => {
    try {
        const { location, networkIp } = req.body;
        const user = req.user;

        const date = getIndianTodayDate();

        const company = await Company.findById(user.company).select(
            "attendanceBy attendanceCheckBy"
        );
        if (!company)
            return res.status(404).json({ message: "Company not found." });

        if (company.attendanceBy !== "Self") {
            return res
                .status(403)
                .json({
                    message:
                        "Self check-out not Open by admin and attendance assign employee.",
                });
        }

        const employee = await Employee.findOne({
            user: user._id,
            company: company._id,
            isActive: true,
            verify: "Verify"
        });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        if (company.attendanceCheckBy?.location?.enable) {
            const { lat, long } = company.attendanceCheckBy.location.value;
            if (!location || !location.lat || !location.long) {
                return res
                    .status(400)
                    .json({ message: "Location are required. Attendance not allowed." });
            }
            const distance = getDistance(location.lat, location.long, lat, long);
            if (distance > 500) {
                return res
                    .status(403)
                    .json({ message: "Location mismatch. Attendance not allowed." });
            }
        }

        if (company.attendanceCheckBy?.networkIp?.enable) {
            if (networkIp !== company.attendanceCheckBy.networkIp.value) {
                return res
                    .status(403)
                    .json({ message: "Network IP mismatch. Attendance not allowed." });
            }
        }

        const attendance = await Attendance.findOne({
            employeeId: employee._id,
            date,
            company: company._id,
        });

        if (!attendance) {
            return res.status(404).json({ message: "Attendance not recoded." });
        }

        if (!attendance.checkIn) {
            return res
                .status(404)
                .json({ message: "Check-in not found. Cannot check-out." });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: "Check-out already marked." });
        }

        if (attendance.checkIn >= getUtcDateTime()) {
            return res
                .status(400)
                .json({ message: "Check-out time is not before check-in." });
        }

        attendance.checkOut = getUtcDateTime();
        attendance.workHours =
            (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);

        await attendance.save();
        res.status(200).json({ message: "Check-out successful.", attendance });
    } catch (error) {
        console.log(error);
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getSelfAttendanceByDateRange = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const user = req.user;

        if (!startDate || !endDate) {
            return res
                .status(400)
                .json({ message: "Start date and end date are required." });
        }

        const employee = await Employee.findOne({
            user: user._id,
            company: user.company,
            isActive: true,
            verify: "Verify"
        });
        if (!employee) {
            return res.status(404).json({ message: "Employee not found." });
        }

        // Convert dates to proper format (IST) and validate

        const from = new Date(startDate);
        const to = new Date(endDate);
        const today = getIndianTodayDate();

        const startDateTime = new Date(from.setUTCHours(1, 30, 0, 0));
        const endDateTime = new Date(to.setUTCHours(2, 30, 0, 0));

        console.log(startDateTime, endDateTime, today);

        // Validate date range
        if (isNaN(startDateTime) || isNaN(endDateTime)) {
            return res
                .status(400)
                .json({ success: false, message: "Invalid date format" });
        }
        if (startDateTime > today || endDateTime > today) {
            return res
                .status(400)
                .json({ success: false, message: "Future dates are not allowed" });
        }
        if (endDateTime < startDateTime) {
            return res
                .status(400)
                .json({ success: false, message: "toDate cannot be before fromDate" });
        }

        const attendanceRecords = await Attendance.find({
            employeeId: employee._id,
            date: { $gte: startDateTime, $lte: endDateTime },
            company: user.company,
        });

        res
            .status(200)
            .json({
                message: "Attendance records fetched successfully.",
                attendanceRecords,
            });
    } catch (error) {
        res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

exports.getAttendanceAnalysis = async (req, res) => {
    try {
        const { month, year } = req.query;
        const companyId = req.user.company;

        if (!companyId || !month || !year) {
            return res
                .status(400)
                .json({ error: "CompanyId, month, and year are required" });
        }

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        // Fetch employees for the company with user details
        const employees = await Employee.find({
            company: companyId,
            isActive: true,
            verify: "Verify"
        }).populate("user", "name email");

        // Get attendance records for the month
        const attendanceRecords = await Attendance.find({
            company: companyId,
            date: { $gte: startDate, $lte: endDate },
        });

        // Get holidays for the company in the specified month
        const holidays = await Holiday.find({
            company: companyId,
            date: { $gte: startDate, $lte: endDate },
        });

        const analysis = employees.map((employee) => {
            const employeeAttendance = attendanceRecords.filter((record) =>
                record.employeeId.equals(employee._id)
            );

            const stats = {
                employeeId: employee._id,
                name: employee.user.name,
                email: employee.user.email,
                designation: employee.designation,
                totalPresent: 0,
                totalAbsent: 0,
                totalHalfDay: 0,
                totalLeave: 0,
                totalRemote: 0,
                totalHoliday: 0,
                totalWorkingHours: 0,
                avgWorkingHours: 0,
                totalWorkingDays: 0,
            };

            employeeAttendance.forEach((record) => {
                stats.totalWorkingHours += record.workHours || 0;

                switch (record.status) {
                    case "Present":
                        stats.totalPresent++;
                        break;
                    case "Absent":
                        stats.totalAbsent++;
                        break;
                    case "Half-Day":
                        stats.totalHalfDay++;
                        break;
                    case "Leave":
                        stats.totalLeave++;
                        break;
                    case "Remote":
                        stats.totalRemote++;
                        break;
                    case "Holiday":
                        stats.totalHoliday++;
                        break;
                }
            });

            const workingDays =
                stats.totalPresent + stats.totalHalfDay + stats.totalRemote;
            stats.avgWorkingHours =
                workingDays > 0
                    ? (stats.totalWorkingHours / workingDays).toFixed(2)
                    : 0;
            stats.totalWorkingDays = workingDays;

            return stats;
        });

        res
            .status(200)
            .json({ success: true, analysis, totalHolidays: holidays.length });
    } catch (error) {
        console.error("Error in getAttendanceAnalysis:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
