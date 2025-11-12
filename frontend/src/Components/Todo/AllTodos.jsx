import React, { useState, useEffect } from "react";
import { todoServices } from "../../services/todoServices";
import { getVerifiedEmployees } from "../../services/employeeServices";
import DateCarousel from "./DateCarousel";

const AllTodos = () => {
  const [todos, setTodos] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEmployee, setSelectedEmployee] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch todos and employees
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [todosResponse, employeesResponse] = await Promise.all([
          todoServices.getAllTodos(),
          getVerifiedEmployees(),
        ]);
        setTodos(todosResponse.data);
        setEmployees(employeesResponse.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter todos based on selected date and employee
  const filteredTodos = todos.filter((todo) => {
    const matchesDate =
      new Date(todo.dueDate).toDateString() === selectedDate.toDateString();
    const matchesEmployee =
      selectedEmployee === "all" || todo.user._id === selectedEmployee;
    return matchesDate && matchesEmployee;
  });
  const employeeFilteredTodos = todos.filter(
    (todo) => selectedEmployee === "all" || todo.user._id === selectedEmployee
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Todos</h1>

          {/* Standard Select Dropdown */}
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Employees</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee.user._id}>
                {employee.user.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
           <div colSpan="4" className="flex justify-center items-center h-64 ">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
         </div>
        ) : (
          <>
            <DateCarousel
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              todos={employeeFilteredTodos}
            />

            {/* Todo Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Task Details
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Priority
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Assigned To
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Conclusion
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTodos.map((todo) => (
                    <tr
                      key={todo._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex flex-col space-y-2">
                          <div className="flex items-start justify-between">
                            <span className="font-medium text-gray-900">
                              {todo.title}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">
                            {todo.description}
                          </p>
                          <span className="text-xs text-gray-500">
                            Due: {new Date(todo.dueDate).toLocaleDateString()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            todo.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : todo.priority === "Medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {todo.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {todo.user.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {todo.conclusion || "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {todo.remark || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredTodos.length === 0 && (
                    <tr>
                      <td
                        colSpan="5"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No todos found for this date
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AllTodos;
