import { useState, useEffect } from "react";
import { todoServices } from "../../services/todoServices";
import { Pencil, Loader } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import DateCarousel from "./DateCarousel";
import TodoForm from "./TodoForm";

const Todo = () => {
  const [todos, setTodos] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [conclusion, setConclusion] = useState("");
  const [remark, setRemark] = useState("");
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [isAddingConclusion, setIsAddingConclusion] = useState(false);
  const [isAddingRemark, setIsAddingRemark] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState(null);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [savingConclusion, setSavingConclusion] = useState(false);
  const [savingRemark, setSavingRemark] = useState(false);

  const fetchAllTodos = async () => {
    setIsPageLoading(true);
    try {
      const response = await todoServices.getTodos();
      setTodos(response.data);
    } catch (err) {
      console.log(err);
      toast.error("Failed to fetch Todo", err.message);
    } finally {
      setIsPageLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTodos();
  }, []);

  const filteredTodos = todos.filter(
    (todo) =>
      new Date(todo.dueDate).toDateString() === selectedDate.toDateString()
  );

  const isTodoEditable = (todoDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todoDueDate = new Date(todoDate);
    todoDueDate.setHours(0, 0, 0, 0);
    return todoDueDate >= today;
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo._id);
    setEditingTodo(todo);
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTodo) {
        await todoServices.updateTodo(editingTodo._id, formData);
        toast.success("Successfully updated todo");
      } else {
        await todoServices.createTodo(formData);
        toast.success("Successfully created todo");
      }
      setFormModalOpen(false);
      setEditingTodo(null);
      fetchAllTodos();
    } catch (error) {
      toast.error( error?.response?.data?.error || "Error with todo:");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddConclusion = async (todoId) => {
    setSavingConclusion(true);
    try {
      await todoServices.updateTodo(todoId, { conclusion });
      setConclusion("");
      setIsAddingConclusion(false);
      setEditingTodoId(null);
      fetchAllTodos();
      toast.success("Successfully add conclusion");
    } catch (error) {
      toast.error(error?.response?.data.message ||"Error adding conclusion:");
    } finally {
      setSavingConclusion(false);
    }
  };

  const handleAddRemark = async (todoId) => {
    setSavingRemark(true);
    try {
      await todoServices.updateTodo(todoId, { remark });
      setRemark("");
      setIsAddingRemark(false);
      setEditingTodoId(null);
      fetchAllTodos();
      toast.success("Successfully add remark");
    } catch (error) {
      toast.error(error?.response?.data.message || "Error adding remark:");
    } finally {
      setSavingRemark(false);
    }
  };

  if (isPageLoading) {
    return (
      <div colSpan="4" className="flex justify-center items-center h-64 ">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer
        autoClose={3000}
        position="top-center"
        style={{ marginTop: "50px" }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Todo Manager</h1>
          <button
            onClick={() => setFormModalOpen(true)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Create Todo
          </button>
        </div>

        <DateCarousel
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          todos={todos}
        />

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
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/5">
                  Conclusion
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/5">
                  Remark
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 w-1/5">
                  Action
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
                    {editingTodoId === todo._id && isAddingConclusion ? (
                      <div className="space-y-2">
                        <textarea
                          value={conclusion}
                          onChange={(e) => setConclusion(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          rows="3"
                          placeholder="Enter conclusion..."
                          disabled={savingConclusion}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddConclusion(todo._id)}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center space-x-1"
                            disabled={savingConclusion}
                          >
                            {savingConclusion && (
                              <Loader className="w-4 h-4 animate-spin" />
                            )}
                            <span>
                              {savingConclusion ? "Saving..." : "Save"}
                            </span>
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingConclusion(false);
                              setEditingTodoId(null);
                              setConclusion("");
                            }}
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            disabled={savingConclusion}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {todo.conclusion ? (
                          <p className="text-sm text-gray-600 flex gap-2 cursor-pointer">
                            {todo.conclusion}
                            {isTodoEditable(todo.dueDate) && (
                              <Pencil
                                size={18}
                                onClick={() => {
                                  setEditingTodoId(todo._id);
                                  setIsAddingConclusion(true);
                                  setConclusion(todo.conclusion);
                                }}
                              />
                            )}
                          </p>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTodoId(todo._id);
                              setIsAddingConclusion(true);
                            }}
                            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-blue-700 transition-colors"
                          >
                            Add Conclusion
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingTodoId === todo._id && isAddingRemark ? (
                      <div className="space-y-2">
                        <textarea
                          value={remark}
                          onChange={(e) => setRemark(e.target.value)}
                          className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          rows="3"
                          placeholder="Enter remark..."
                          disabled={savingRemark}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleAddRemark(todo._id)}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
                            disabled={savingRemark}
                          >
                            {savingRemark && (
                              <Loader className="w-4 h-4 animate-spin" />
                            )}
                            <span>{savingRemark ? "Saving..." : "Save"}</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingRemark(false);
                              setEditingTodoId(null);
                              setRemark("");
                            }}
                            className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                            disabled={savingRemark}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {todo.remark ? (
                          <p className="text-sm text-gray-600 flex gap-2 cursor-pointer">
                            {todo.remark}
                            <Pencil
                              size={18}
                              onClick={() => {
                                setEditingTodoId(todo._id);
                                setIsAddingRemark(true);
                                setRemark(todo.remark);
                              }}
                            />
                          </p>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingTodoId(todo._id);
                              setIsAddingRemark(true);
                            }}
                            className="bg-purple-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-purple-700 transition-colors"
                          >
                            Add Remark
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {isTodoEditable(todo.dueDate) && (
                      <Pencil
                        size={18}
                        className="cursor-pointer"
                        onClick={() => handleEditClick(todo)}
                      />
                    )}
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

        <TodoForm
          isOpen={formModalOpen}
          onClose={() => {
            setFormModalOpen(false);
            setEditingTodo(null);
          }}
          onSubmit={handleFormSubmit}
          editingTodo={editingTodo}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default Todo;
