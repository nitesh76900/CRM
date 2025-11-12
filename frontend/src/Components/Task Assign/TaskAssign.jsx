import {
  Plus,
  Edit2,
  Filter,
  X,
  Clock,
  User,
  UserCheck,
  Flag,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import taskServices from "../../services/taskServices";
import { getVerifiedEmployees } from "../../services/employeeServices";
import { toast, ToastContainer } from "react-toastify";
import authServices from "../../services/authServices";
import { DateRangePicker } from "react-date-range";
import { format, addDays } from "date-fns";
import { useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../store/slices/userSlice";


const Modal = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md">
        <div className="flex justify-between items-center p-3 border-b">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

const TaskTable = ({ tasks, onEdit }) => {
  const [role, setRole] = useState("");
    const [tasksPermissions, setTasksPermissions] = useState(null);

    const user = useSelector(selectUser)

  const fetchProfile = async () => {
  
    if (user&&user.company) {
      setRole("Employee");
      console.log(
        "response.user.role.permissions",
        user.role.permissions
      );
      setTasksPermissions(user.role.permissions.tasks);
    } else if (user&&user.employees) {
      setRole("CompanyAdmin");
    } else if (user&&user.role === "SuperAdmin") {
      setRole("SuperAdmin");
    }
};
  
    useEffect(() => {
      fetchProfile();
    }, []);

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-50 text-red-700",
      medium: "bg-yellow-50 text-yellow-700",
      low: "bg-green-50 text-green-700",
    };
    return colors[priority.toLowerCase()] || colors.medium;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-100 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Title
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Description
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Assigned By
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Assigned To
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Due Date
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Priority
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Status
            </th>
            <th className="p-3 text-left text-sm font-medium text-gray-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task._id}
              className="border-b hover:bg-gray-50 group relative"
            >
              <td className="p-3 text-sm text-gray-700">{task.title}</td>
              <td className="p-3 text-sm text-gray-700">{task.description}</td>
              <td className="p-3 text-sm text-gray-700">
                {task.assignedBy.name}
              </td>
              <td className="p-3 text-sm text-gray-700">
                {task.assignedTo.user.name}
              </td>
              <td className="p-3 text-sm text-gray-700">
                {format(new Date(task.dueDate), "MMM d, yyyy")}
              </td>
              <td className="p-3">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(
                    task.priority
                  )}`}
                >
                  {task.priority}
                </span>
              </td>
              <td className="p-3">
                <div className="flex items-center gap-1">
                  {task.conclusion ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      <p className="text-sm text-green-700">Completed</p>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />
                      <p className="text-sm text-yellow-700">Pending</p>
                    </>
                  )}
                </div>
              </td>
              <td className="p-3">
                {!task.conclusion && (
                  <button
                    onClick={() => onEdit(task)}
                    className={` disabled:opacity-50${
                      role === "CompanyAdmin" ||
                      tasksPermissions?.update
                        ? "text-red-500 hover:text-red-700 cursor-pointer"
                        : "bg-gray-400 text-gray-500 cursor-not-allowed"
                    }`}
                    disabled={
                      !(
                        role === "CompanyAdmin" ||
                        tasksPermissions?.update
                      )
                    }
                  >
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </td>
              {task.conclusion && (
                <div className=" min-w-[150px] absolute right-[50%] top-[-100%] px-2 bg-gray-200 rounded-xl shadow-lg hidden group-hover:block">
                  <p className=" font-bold text-gray-800">conclusion:</p>
                  {task.conclusion}
                </div>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      {tasks.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No task Available
            </div>
          )} 
    </div>
  );
};

const TaskAssign = () => {
  const [tasks, setTasks] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [filters, setFilters] = useState({
    assignedBy: "",
    assignedTo: "",
    startDate: "",
    endDate: "",
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "Medium",
    assignedTo: "",
    dueDate: "",
  });
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
    const [tasksPermissions, setTasksPermissions] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateRange, setDateRange] = useState({
    selection: {
      startDate: new Date(),
      endDate: addDays(new Date(), 7),
      key: "selection",
    },
  });

  const datePickerRef = useRef(null);
  

    const user = useSelector(selectUser)
   
     const fetchProfile = async () => {
     
       if (user&&user.company) {
         setRole("Employee");
         console.log(
           "response.user.role.permissions",
           user.role.permissions
         );
         setTasksPermissions(user.role.permissions.tasks);
       } else if (user&&user.employees) {
         setRole("CompanyAdmin");
       } else if (user&&user.role === "SuperAdmin") {
         setRole("SuperAdmin");
       }
   };
  
    useEffect(() => {
      fetchProfile();
    }, []);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [filters]); // Fetch tasks whenever filters change

  const fetchTasks = async () => {
    try {
      const response = await taskServices.getAllTasks(filters);
      setTasks(response.tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      toast.error("Error fetching tasks:", error)
    }finally{
      setLoading(false)
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await getVerifiedEmployees();
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (selectedTask) {
        await taskServices.updateTask(selectedTask._id, formData);
        toast.success("Successfully save task")

      } else {
        await taskServices.createTask(formData);
      }
      setIsModalOpen(false);
      fetchTasks();
      resetForm();
    } catch (error) {
      console.error("Error saving task:", error);
      toast.error(error?.response?.data.message || "Error saving task:");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      priority: "Medium",
      assignedTo: "",
      dueDate: "",
    });
    setSelectedTask(null);
  };

  const handleEdit = (task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo._id,
      dueDate: format(new Date(task.dueDate), "yyyy-MM-dd"),
    });
    setIsModalOpen(true);
  };


  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle date change
  const handleDateChange = (item) => {
    setDateRange({ selection: item.selection });
    setFilters({
      ...filters,
      startDate: format(item.selection.startDate, "yyyy-MM-dd"),
      endDate: format(item.selection.endDate, "yyyy-MM-dd"),
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <ToastContainer position="top-center" autoClose={3000} style={{marginTop:"50px"}}/>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold text-gray-800">Task Management</h1>
        <button
          onClick={() => {
            resetForm();
            setIsModalOpen(true);
          }}
          disabled={!(role === "CompanyAdmin" || tasksPermissions?.create)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm 
    ${
      role === "CompanyAdmin" || tasksPermissions?.create
        ? "bg-blue-500 text-white cursor-pointer"
        : "bg-gray-400 text-gray-200 cursor-not-allowed"
    }`}
        >
          <Plus className="w-4 h-4 mr-1" />
          Create Task
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm mb-4 p-3">
        <div className="flex items-center mb-3">
          <Filter className="w-4 h-4 mr-1.5" />
          <h2 className="text-sm font-medium">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) =>
                setFilters({ ...filters, assignedTo: e.target.value })
              }
              className="w-full border border-gray-300 p-2 rounded-lg cursor-pointer"
            >
              <option value="">All employees</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.user.name}
                </option>
              ))}
            </select>
          </div>
          <div className="relative">
      <label className="block text-xs font-medium text-gray-700 mb-1">
        Select Date Range
      </label>
      <input
        type="text"
        readOnly
        value={`${format(dateRange.selection.startDate, "dd MMM yyyy")} - ${format(dateRange.selection.endDate, "dd MMM yyyy")}`}
        onClick={() => setShowDatePicker(!showDatePicker)}
        className="w-full border border-gray-300 p-2 rounded-lg text-center cursor-pointer text-[15px]"
      />

      {/* Date Picker Modal */}
      {showDatePicker && (
        <div ref={datePickerRef} className="absolute top-full right-0 z-50 bg-white shadow-lg rounded-lg mt-2">
          <DateRangePicker
            onChange={handleDateChange}
            months={1}
            minDate={addDays(new Date(), -300)}
            maxDate={addDays(new Date(), 900)}
            direction="vertical"
            scroll={{ enabled: true }}
            ranges={[dateRange.selection]}
          />
        </div>
      )}
    </div>
        </div>
      </div>
      {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>):(   <TaskTable tasks={tasks} onEdit={handleEdit} />)}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedTask ? "Edit Task" : "Create New Task"}
      >
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Assign To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) =>
                setFormData({ ...formData, assignedTo: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
              required
            >
              <option value="">Select employee</option>
              {employees.map((employee) => (
                <option key={employee._id} value={employee._id}>
                  {employee.user.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full border rounded-md p-2 text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 text-sm"
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : selectedTask
              ? "Update Task"
              : "Create Task"}
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default TaskAssign;
