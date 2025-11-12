import React, { useState, useEffect } from "react";
// import LeadSection from "./page/LeadSection";
import TaskSection from "./page/TaskSection";
// import EventSection from "./page/EventSection";
import StickyNotes from "./page/StickyNotes";
// import LeadsStatus from "./page/LeadsStatus";
// import LeadSourceChart from "./page/LeadsSource";
import Calendar from "./page/Calendar";
// import { getDashboardData } from "../../services/dashboardServices";
import { toast, ToastContainer } from "react-toastify";
import EmployeeLeadSection from '../Dashboard/page/EmployeeLeadSection'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    latestLeads: [],
    todayMeetings: [],
    activeReminders: [],
    chartData: {
      statusStats: [],
      sourceStats: [],
      forStats: [],
    },
  });

  

  return (
    <div>
      <ToastContainer position="top-center" autoClose={3000}style={{marginTop:"50px"}}/>
      <h1 className="text-3xl font-bold mb-10">Dashboard</h1>

      <div className="flex justify-between space-x-4">
        {/* <LeadSection leads={dashboardData.latestLeads} /> */}
        <EmployeeLeadSection className="flex-1"/>
        <TaskSection/>
        {/* <EventSection
          meetings={dashboardData.todayMeetings}
          reminders={dashboardData.activeReminders}
        /> */}
      </div>
      <div className="mt-10">
        <StickyNotes />
      </div>
      
      <div>
        <Calendar />
      </div>
    </div>
  );
}

export default Dashboard;
