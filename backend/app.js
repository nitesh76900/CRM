const dotenv = require("dotenv");
dotenv.config();
const morgan = require("morgan");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174","https://codedev-crm-company-frontend.vercel.app"],
    credentials: true,
  })
);

// app.get("/", (req, res) => {
//   res.status(200).send("Setup backend");
// });

const authRoutes = require("./routes/auth.routes")
const superAdminRoutes = require("./routes/superAdmin.routes")
const companyRoutes = require("./routes/company.routes")
const todoRoutes = require("./routes/todo.routes")
const taskAssignedRoutes = require("./routes/taskAssigned.routes")
const meetingRoutes = require("./routes/meeting.routes")
const contactRoutes = require("./routes/contact.routes")
const leadRoutes = require("./routes/lead.routes")
const reminderRoutes = require("./routes/reminder.routes")
const stickyNoteRoutes = require("./routes/stickyNote.routes")
const calendarRoutes = require("./routes/calendar.routes")
const dashboardRoutes = require("./routes/dashboard.routes")
const attendanceRoutes = require("./routes/attendance.routes")

app.use("/api/v1/auth", authRoutes)
app.use("/api/v1/super-admin", superAdminRoutes)
app.use("/api/v1/company", companyRoutes)
app.use("/api/v1/todo", todoRoutes)
app.use("/api/v1/task-assigned", taskAssignedRoutes)
app.use("/api/v1/meeting", meetingRoutes)
app.use("/api/v1/contact", contactRoutes)
app.use("/api/v1/lead", leadRoutes)
app.use("/api/v1/reminder", reminderRoutes)
app.use("/api/v1/sticky-note", stickyNoteRoutes)
app.use("/api/v1/calender-data", calendarRoutes)
app.use("/api/v1/dashboard-data", dashboardRoutes)
app.use("/api/v1/attendance", attendanceRoutes)

// Express route to verify token
app.get("/api/v1/verify-token", (req, res) => {
  let token=null
  token = req.cookies.token; // Extract the token from the cookies
  if (!token) {
    // console.log("inside " + token)
    return res.status(401).json({ isAuthenticated: false });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
    res.status(200).json({ isAuthenticated: true });
  } catch (err) {
    console.log("error in verify token = "+err)
    res.status(401).json({ isAuthenticated: false });
  }
});


module.exports = app;
