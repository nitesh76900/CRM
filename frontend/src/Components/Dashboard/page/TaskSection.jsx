import React, { useEffect, useState } from "react";
import taskServices from "../../../services/taskServices";

const TaskSection = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] =useState(true)

  const fetchTasks = async () => {
    try {
      const data = await taskServices.getMyTasks();
      if (Array.isArray(data.tasks)) {
        setTasks(data.tasks);
      } else {
        console.warn("⚠ Invalid Response:", data);
      }
    } catch (error) {
      console.error("❌ Error fetching tasks:"||error?.response?.data.message);
    } finally{
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  
  return (
    <div className=" w-[48%] h-[350px] overflow-y-auto p-4 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-3">Tasks</h2>
      { loading ? (
      <div colSpan="4" className="flex justify-center items-center h-64 ">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>)
    :( <div>
      
      {tasks?.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No Tasks Available
            </div>
          )}
      <ul>
        {tasks.map((task) => (
          <li
            key={task._id || task._id}
            className="p-2 bg-gray-100 rounded mb-2"
          >
            <span className="text-xl">{task.title}</span>-<span className="text-gray-600">{new Date(task.dueDate).toLocaleDateString()}</span>
            <br />
            <span className="text-gray-600">{task.description}</span> <br />
          </li>
        ))}
        
      </ul>
      </div>)}
    </div>
  );
};

export default TaskSection;
