import { useState, useEffect } from "react";
import taskServices from "../../services/taskServices";
import { ToastContainer, toast } from "react-toastify";

const EmployeeTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({
    title: "",
    priority: "",
    dueDate: "",
  });
  const [modalTask, setModalTask] = useState(null);
  const [conclusion, setConclusion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState (true);

  const fetchTasks = async () => {
    try {
      const data = await taskServices.getMyTasks();
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
        // toast.success("fetch data sucessfully")
      } else {
        toast.warn("⚠ Invalid Response:", data);
      }
    } catch (error) {
      toast.error(error?.response?.data.message || "❌ Error fetching tasks:");
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredTasks = tasks.filter(
    (task) =>
      (filters.title === "" ||
        task.title.toLowerCase().includes(filters.title.toLowerCase())) &&
      (filters.priority === "" || task.priority === filters.priority) &&
      (filters.dueDate === "" || task.dueDate === filters.dueDate)
  );

  const openModal = (task) => {
    if (!task || !task._id) {
      toast.error("❌ Task ID is missing!", task);
      return;
    }
    setModalTask({ ...task, id: task._id });
    setConclusion(task.conclusion || "");
  };

  const closeModal = () => {
    setModalTask(null);
    setConclusion("");
    setIsSubmitting(false);
  };

  const handleSubmit = async () => {
    if (!modalTask || !modalTask.id) {
      toast.error("❌ Task ID is undefined!");
      return;
    }

    setIsSubmitting(true);

    try {
      await taskServices.addConclusion(modalTask.id, conclusion);
      await fetchTasks(); // Refresh tasks after submission
      toast.success("Task Submitted");
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data.message || "❌ Error updating conclusion:");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-center"
        style={{ marginTop: "50px" }}
        autoClose={3000}
      />
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Task Management
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
          <input
            type="text"
            name="title"
            placeholder="Search tasks..."
            value={filters.title}
            onChange={handleFilterChange}
            className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            name="priority"
            value={filters.priority}
            onChange={handleFilterChange}
            className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Priorities</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input
            type="date"
            name="dueDate"
            value={filters.dueDate}
            onChange={handleFilterChange}
            className="p-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

      {loading ? (<div colSpan="4" className="flex justify-center items-center h-64 ">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
          </div>):
          filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 text-sm">
                No tasks found matching your filters
              </p>
            </div>
          )
          :(
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <div
              key={task.id || task._id}
              className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {task.title}
                </h3>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === "High"
                      ? "bg-red-100 text-red-800"
                      : task.priority === "Medium"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                {task.description}
              </p>
              <p className="text-xs text-gray-500 mb-2">
                Due: {new Date(task.dueDate).toLocaleDateString()}
              </p>

              {task.conclusion ? (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                    <span className="font-medium">Conclusion:</span>{" "}
                    {task.conclusion}
                  </p>
                  <p className="text-xs text-gray-400 mb-2">
                    Submitted:{" "}
                    {new Date(task.conclusionSubmitTime).toLocaleDateString()}
                  </p>
                  <button
                    className="w-full text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                    onClick={() => openModal(task)}
                  >
                    Edit Conclusion
                  </button>
                </div>
              ) : (
                <button
                  className="w-full text-xs px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  onClick={() => openModal(task)}
                >
                  Add Conclusion
                </button>
              )}
              
            </div>
          ))}
        </div>)}
        
      </div>

      {modalTask && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md m-4 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">
                {modalTask.title}
              </h3>
            </div>
            <div className="p-4">
              <textarea
                className="w-full p-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your conclusion..."
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2 p-4 bg-gray-50">
              <button
                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50"
                onClick={closeModal}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;
