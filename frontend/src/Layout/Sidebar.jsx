import React, { useEffect, useState } from "react";
import {
  ChevronRight,
  Home,
  Filter,
  Bell,
  LogOut,
  Menu,
  X,
  ClipboardList,
  Handshake,
  Contact,
  ShieldCheck,
  NotebookPen,
  CaptionsIcon,
  Settings,
  Building,
  Building2,
} from "lucide-react";
import { useNavigate } from "react-router";
import authServices from "../services/authServices";
import { getUnverifiedEmployees } from "../services/employeeServices";
import { getLeads } from "../services/leadServices";
import taskServices from "../services/taskServices";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, clearUser } from "../store/slices/userSlice";
import { BsCalendar2Check } from "react-icons/bs";

const Sidebar = ({ isOpen, isSidebarOpen, setSidebarOpen }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const [role, setRole] = useState("");
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unverifiedEmployees, setUnverifiedEmployees] = useState(0);
  const [newLeads, setNewLeads] = useState(0);
  const [unsubmittedTasks, setUnsubmittedTasks] = useState(0);
  const navigate = useNavigate();

  const fetchUnverifiedEmployees = async () => {
    try {
      const response = await getUnverifiedEmployees();
      console.log("fetchUnverifiedEmployees", response);
      setUnverifiedEmployees(response.data.length || 0);
    } catch (error) {
      console.error("Error fetching unverified employees:", error);
    }
  };

  const fetchLeads = async () => {
    try {
      const response = await getLeads();
      // console.log("rgetLeads", response.data);
      const newLeadsCount = response.data.filter(
        (lead) => lead.status === "New"
      ).length;
      setNewLeads(newLeadsCount);
    } catch (error) {
      console.error("Error fetching leads:", error);
    }
  };

  const fetchTasks = async () => {
    try {
      const response = await taskServices.getMyTasks();
      // console.log("getMyTasks", response);
      const unsubmittedCount = response.tasks.filter(
        (task) => !task.conclusionSubmitTime
      ).length;
      setUnsubmittedTasks(unsubmittedCount);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  useEffect(() => {
    if (user && user.company) {
      setRole("Employee");
      setPermissions(user?.role?.permissions);
    } else if (user && user.employees) {
      setRole("CompanyAdmin");
    } else if (user && user?.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
  }, []);

  useEffect(() => {
    if (role) {
      if (role === "CompanyAdmin") {
        fetchUnverifiedEmployees();
        fetchLeads();
      }
      if (role === "Employee" && permissions?.leads?.read) {
        fetchLeads();
      }
      fetchTasks();
    }
  }, [role, permissions]);

  const NotificationBadge = ({ count }) => {
    if (!count) return null;
    return (
      <span className="absolute top-2 left-2 bg-red-500 text-white text-xs rounded-full w-3 h-3 flex items-center justify-center">
        {count > 99 ? "99+" : count}
      </span>
    );
  };

  const getMenuItems = () => {
    switch (role) {
      case "SuperAdmin":
        return [
          {
            icon: Home,
            label: "Dashboard",
            navigate: "/super-admin-dashboard",
          },
          {
            icon: Building,
            label: "Verify-Company",
            navigate: "/company-verification",
          },
          {
            icon: Building2,
            label: "Companies",
            navigate: "/companies",
          },
        ];

      case "CompanyAdmin":
        return [
          { icon: Home, label: "Dashboard", navigate: "/" },
          { icon: NotebookPen, label: "My Todo", navigate: "/todo" },
          {
            icon: NotebookPen,
            label: "All Todo's",
            navigate: "/all-user-todo",
          },
          {
            icon: Filter,
            label: "Lead",
            navigate: "/lead",
            badge: newLeads,
          },
          {
            icon: ShieldCheck,
            label: "Emp. Verification",
            navigate: "/employee-verification",
            badge: unverifiedEmployees,
          },
          {
            icon: BsCalendar2Check,
            label: "Attendance",
            navigate: "/date-attendance",
          },
          {
            icon: ClipboardList,
            label: "Assign Task",
            navigate: "/assign-task",
            badge: unsubmittedTasks,
          },
          { icon: Contact, label: "Contacts", navigate: "/contacts" },
          { icon: Bell, label: "Reminder", navigate: "/reminder" },
          { icon: Handshake, label: "Meetings", navigate: "/meetings" },
          { icon: Settings, label: "Settings", navigate: "/settings" },
        ];

      case "Employee":
        const employeeMenuItems = [
          { icon: Home, label: "Dashboard", navigate: "/employee-dashboard" },
          { icon: NotebookPen, label: "My Todo", navigate: "/todo" },
          ...(permissions?.todos?.read
            ? [
                {
                  icon: NotebookPen,
                  label: "All Todo's",
                  navigate: "/all-user-todo",
                },
              ]
            : user?.team?.length > 0
            ? [
                {
                  icon: NotebookPen,
                  label: "Team Todo's",
                  navigate: "/team-todo",
                },
              ]
            : []),
          { icon: Bell, label: "Reminder", navigate: "/reminder" },
          {
            icon: CaptionsIcon,
            label: "Submit Task",
            navigate: "/employee-task",
            badge: unsubmittedTasks,
          },
        ];

        if (permissions.attendance?.read) {
          employeeMenuItems.push({
            icon: BsCalendar2Check,
            label: "Attendance",
            navigate: "/date-attendance",
          });
        } else {
          employeeMenuItems.push({
            icon: BsCalendar2Check,
            label: "Attendance",
            navigate: "/self-attendance",
          });
        }
        if (permissions) {
          if (permissions.leads?.read) {
            employeeMenuItems.push({
              icon: Filter,
              label: "Lead",
              navigate: "/lead",
              badge: newLeads,
            });
            employeeMenuItems.push({
              icon: Contact,
              label: "Contacts",
              navigate: "/contacts",
            });
          }
          if (permissions.tasks?.read) {
            employeeMenuItems.push({
              icon: ClipboardList,
              label: "Assign Task",
              navigate: "/assign-task",
            });
          }
          

          if (permissions.meeting?.read) {
            employeeMenuItems.push({
              icon: Handshake,
              label: "Meetings",
              navigate: "/meetings",
            });
          }
          // if (permissions.todos?.read) {
          //   employeeMenuItems.push({
          //     icon: NotebookPen,
          //     label: "All Todo's",
          //     navigate: "/all-user-todo",
          //   });
          // } else {
          //   if (user.team.length > 0) {
          //     employeeMenuItems.push({
          //       icon: NotebookPen,
          //       label: "Team Todo's",
          //       navigate: "/team-todo",
          //     });
          //   }
          // }
        }

        return employeeMenuItems;

      default:
        return [];
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authServices.logout();
      console.log("Logout successful:", response);
      dispatch(clearUser());
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      setError(error.message || "Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside
      className={`fixed left-0 top-14 h-[calc(100vh-3.5rem)] bg-white shadow-lg transition-all duration-300 z-20 
      flex flex-col 
      ${isOpen ? "w-48" : "w-15"}`}
    >
      <div className="flex justify-end">
        <button
          onClick={() => setSidebarOpen(!isSidebarOpen)}
          className="w-[40px] text-black py-3 px-2 mt-3 mr-3 cursor-pointer rounded-lg border border-none"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <div className="flex flex-col">
        {getMenuItems().map((item, index) => (
          <button
            onClick={() => handleNavigation(item.navigate)}
            key={index}
            className="flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors relative"
          >
            <item.icon size={20} />
            {item?.badge > 0 && <NotificationBadge count={item.badge} />}
            {isOpen && (
              <span className="ml-4 text-sm font-medium">{item.label}</span>
            )}
            {!isOpen && (
              <ChevronRight size={16} className="ml-auto text-gray-400" />
            )}
          </button>
        ))}
      </div>

      <button
        onClick={handleLogout}
        disabled={loading}
        className="mt-auto flex items-center px-4 py-3 mb-5 text-red-600 hover:bg-red-100 transition-colors"
      >
        <LogOut size={20} />
        {isOpen && (
          <span className="ml-4 text-sm font-medium">
            {loading ? "Logging out..." : "Logout"}
          </span>
        )}
      </button>

      {error && (
        <p className="text-red-500 text-center text-sm py-2">{error}</p>
      )}
    </aside>
  );
};

export default Sidebar;
