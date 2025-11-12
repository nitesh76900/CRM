import { useState, useEffect } from "react";

const TodoForm = ({
  isOpen,
  onClose,
  onSubmit,
  editingTodo = null,
  isSubmitting,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "Medium",
  });

  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title,
        description: editingTodo.description,
        dueDate: new Date(editingTodo.dueDate).toISOString().split("T")[0],
        priority: editingTodo.priority,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
      });
    }
  }, [editingTodo]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">
          {editingTodo ? "Edit Todo" : "Create Todo"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(formData);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <p className="text-xs text-gray-500 mb-1">
              Title must be at least 3 characters.
            </p>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <p className="text-xs text-gray-500 mb-1">
              Description must be at least 5 characters.
            </p>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            {/* Allow create for past dates also */}
            {/* <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            /> */}
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) =>
                setFormData({ ...formData, dueDate: e.target.value })
              }
              min={new Date().toISOString().split("T")[0]} // Disable past dates
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting
                ? editingTodo
                  ? "Updating..."
                  : "Creating..."
                : editingTodo
                ? "Update"
                : "Create"}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setFormData({
                  title: "",
                  description: "",
                  dueDate: "",
                  priority: "Medium",
                });
              }}
              className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TodoForm;
