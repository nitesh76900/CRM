import { useEffect, useState } from "react";
import Layout from "./Layout/Layout";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import CompanyRegistration from "./Components/Registration/CompanyRegistration";
import EmployeeRegistration from "./Components/Registration/EmployeeRegistration";
import Lead from "./Components/Leads/Lead";
import CompanyDashboard from "./Components/Dashboard/CompanyDashboard";
import EmployeeDashboard from "./Components/Dashboard/EmployeeDashboard";
import Login from "./Components/Login/Login";
import ResetPasswordForm from "./Components/Login/ResetPasswordForm";
import Roles from "./Components/Roles/Roles";
import EmployeeVerification from "./Components/EmployeeVerification/EmployeeVerification";
import ReminderList from "./Components/Reminder/Reminder";
import ReminderForm from "./Components/Reminder/ReminderForm";
import Settings from "./Components/Settings/Settings";
import LeadSource from "./Components/Settings/Leads/LeadSource";
import LeadStatusLabel from "./Components/Settings/Leads/LeadStatusLabel";
import RoleSettings from "./Components/Settings/Role Settings/RoleSettings";
import EmployeeSettings from "./Components/Settings/EmployeeSettings/EmployeeSettings";
import LeadPage from "./Components/Settings/Leads/LeadFor";
import Todo from "./Components/Todo/Todo";
import TaskAssign from "./Components/Task Assign/TaskAssign";
import EmployeeTasks from "./Components/EmployeeTask/EmployeeTask";
import Meetings from "./Components/Meetings/Meetings";
import Contacts from "./Components/Contacts/Contacts";
import SuperAdminDashboard from "./Components/SuperAdmin/SuperAdminDashboard";
import EmployeePermissions from "./Components/Settings/EmployeeSettings/EmployeePermissions ";
import EmployeeProfile from "./Components/Profile/EmployeeProfile";
import CompanyProfile from "./Components/Profile/CompanyProfile";
import CompanyTable from "./Components/SuperAdmin/CompanyVerification";
import "./App.css";
import AllTodos from "./Components/Todo/AllTodos";
import { fetchUser, selectUser } from "./store/slices/userSlice";
import ProtectedRoute from "./Middleware/ProtectedRoute";
import TeamTodos from "./Components/Todo/TeamTodos";
import CompaniesList from "./Components/SuperAdmin/CompaniesTable";
import CompanyDetails from "./Components/SuperAdmin/CompanyDetails";
import SuperAdminProfile from "./Components/Profile/SuperAdminProfile";
import EmailCredentialsSettings from "./Components/Settings/EmailCredentialsSettings/EmailCredentialsSettings";
import AttendanceSettingsPage from "./Components/Settings/AttendanceSettings/AttendanceSettingsPage";
import AttendanceHolidays from "./Components/Settings/AttendanceSettings/AttendanceHolidays";
import DateAttendancePage from "./Components/Attendance/DateAttendancePage";
import SelfAttendancePage from "./Components/Attendance/SelfAttendancePage";
import { LocationIPProvider } from "./Components/Attendance/LocationIPContext";
import EmployeeAttendance from "./Components/Attendance/EmployeeAttendance";
import AttendanceAnalysisPage from "./Components/Attendance/AttendanceAnalysisPage";
import SkeletonLoader from "./Components/Loader/SkeletonLoader";

function App() {
  const user = useSelector(selectUser);
  const isAuth = useSelector((state) => state.user?.isAuthenticated);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const dispatch = useDispatch();

  // Determine the user's role based on their profile data
  const determineUserRole = (userData) => {
    if (!userData) return null;

    if (userData.role === "SuperAdmin") {
      return "SuperAdmin";
    } else if (userData.employees) {
      return "CompanyAdmin";
    } else if (userData.company) {
      return "Employee";
    }
    return null;
  };

  // Determine the correct dashboard route based on user role
  const getDashboardRoute = (role) => {
    switch (role) {
      case "SuperAdmin":
        return "/super-admin-dashboard";
      case "CompanyAdmin":
        return "/company-dashboard"; // Changed from "/" to "/company-dashboard"
      case "Employee":
        return "/employee-dashboard";
      default:
        return "/login";
    }
  };

  const fetchUserAuth = () => {
    dispatch(fetchUser())
      .then(() => {
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserAuth();
  }, [dispatch]);

  // Set user role whenever the user data changes
  useEffect(() => {
    const role = determineUserRole(user);
    setUserRole(role);
  }, [user]);

  if (loading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              isAuth ? (
                <Navigate to={getDashboardRoute(userRole)} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          {/* Main dashboards */}
          <Route
            path="/employee-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance-holidays"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceHolidays />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/companies"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompaniesList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route path="/company-register" element={<CompanyRegistration />} />
          <Route path="/employee-register" element={<EmployeeRegistration />} />
          <Route
            path="/reset-password/:token"
            element={<ResetPasswordForm />}
          />

          <Route
            path="/lead"
            element={
              <ProtectedRoute permissions={true}>
                <Layout>
                  <Lead />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute>
                <Layout>
                  <Roles />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminder"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReminderList />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reminderForm"
            element={
              <ProtectedRoute>
                <Layout>
                  <ReminderForm />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-verification"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeVerification />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuperAdminProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-details/:id"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyDetails />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceSettingsPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-for"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadPage />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-source"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadSource />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/lead-status-label"
            element={
              <ProtectedRoute>
                <Layout>
                  <LeadStatusLabel />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/role-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <RoleSettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeSettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-permission-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeePermissions />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-email-settings"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmailCredentialsSettings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/todo"
            element={
              <ProtectedRoute>
                <Layout>
                  <Todo />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/team-todo"
            element={
              <ProtectedRoute>
                <Layout>
                  <TeamTodos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-user-todo"
            element={
              <ProtectedRoute>
                <Layout>
                  <AllTodos />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/date-attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <LocationIPProvider>
                    <DateAttendancePage />
                  </LocationIPProvider>
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/self-attendance"
            element={
              <ProtectedRoute>
                <Layout>
                  <LocationIPProvider>
                    <SelfAttendancePage />
                  </LocationIPProvider>
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-attendance/:employeeId"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeAttendance />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/attendance/analysis"
            element={
              <ProtectedRoute>
                <Layout>
                  <AttendanceAnalysisPage />
                </Layout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/assign-task"
            element={
              <ProtectedRoute>
                <Layout>
                  <TaskAssign />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-task"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeTasks />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/meetings"
            element={
              <ProtectedRoute>
                <Layout>
                  <Meetings />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/contacts"
            element={
              <ProtectedRoute>
                <Layout>
                  <Contacts />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/super-admin-dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <SuperAdminDashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-verification"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyTable />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <EmployeeProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/company-profile"
            element={
              <ProtectedRoute>
                <Layout>
                  <CompanyProfile />
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
