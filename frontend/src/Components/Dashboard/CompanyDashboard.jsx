import React, { useState, useEffect } from "react";
import LeadSection from "./page/LeadSection";
import TaskSection from "./page/TaskSection";
import EventSection from "./page/EventSection";
import StickyNotes from "./page/StickyNotes";
import LeadsStatus from "./page/LeadsStatus";
import LeadSourceChart from "./page/LeadsSource";
import Calendar from "./page/Calendar";
import EmployeeList from "./page/EmployData";
import { getDashboardData } from "../../services/dashboardServices";
import { toast, ToastContainer } from "react-toastify";

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

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getDashboardData();

        if (response.data) {
          setDashboardData({
            latestLeads: response.data.latestLeads || [],
            todayMeetings: response.data.todayMeetings || [],
            activeReminders: response.data.activeReminders || [],
            chartData: response.data.chartDate || {
              statusStats: [],
              sourceStats: [],
              forStats: [],
            },
          });
          // console.log("dashboardData.chartData", dashboardData.chartData);
        }
      } catch (error) {
        toast.error(error?.response?.data.message || "Error fetching dashboard data:" );
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div>
      <ToastContainer position="top-center" autoClose={3000}style={{marginTop:"50px"}}/>
      <h1 className="text-3xl font-bold mb-10">Dashboard</h1>

      <div className="flex justify-between">
        <LeadSection leads={dashboardData.latestLeads} />
        <EmployeeList />
        <EventSection
          meetings={dashboardData.todayMeetings}
          reminders={dashboardData.activeReminders}
        />
      </div>
      <div className="mt-10">
        <StickyNotes />
      </div>
      <div className="flex justify-between gap-1 mt-10">
        <LeadsStatus statusStats={dashboardData.chartData.statusStats} />
        <LeadSourceChart sourceStats={dashboardData.chartData.sourceStats} />
      </div>
      <div>
        <Calendar />
      </div>
    </div>
  );
}

export default Dashboard;
