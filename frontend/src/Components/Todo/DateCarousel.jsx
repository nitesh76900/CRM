import { ChevronLeft, ChevronRight } from "lucide-react";

const DateCarousel = ({ selectedDate, setSelectedDate, todos }) => {
  const getDates = () => {
    const dates = [];
    for (let i = -7; i <= 7; i++) {
      const date = new Date(selectedDate);
      date.setDate(selectedDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const getTodoCountForDate = (date) => {
    return todos.filter(
      (todo) => new Date(todo.dueDate).toDateString() === date.toDateString()
    ).length;
  };

  const getIncompleteTodoCount = (date) => {
    return todos.filter(
      (todo) =>
        new Date(todo.dueDate).toDateString() === date.toDateString() &&
        !todo.conclusion
    ).length;
  };

  const hasIncompleteTodos = (date) => {
    return todos.some(
      (todo) =>
        new Date(todo.dueDate).toDateString() === date.toDateString() &&
        (!todo.conclusion || !todo.remark)
    );
  };

  return (
    <div className="flex items-center justify-center space-x-4 mb-6">
      <button
        onClick={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(selectedDate.getDate() - 1);
          setSelectedDate(newDate);
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex space-x-3 overflow-x-auto py-2">
        {getDates().map((date, index) => {
          const todoCount = getTodoCountForDate(date);
          const incompleteCount = getIncompleteTodoCount(date);
          const hasIncomplete = hasIncompleteTodos(date);

          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className="relative group"
            >
              <div
                className={`px-6 py-3 rounded-lg flex flex-col items-center transition-all
                ${
                  date.toDateString() === selectedDate.toDateString()
                    ? "bg-blue-600 text-white"
                    : hasIncomplete
                    ? "bg-red-50 border border-red-200"
                    : "bg-gray-50 border border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div className="text-sm font-medium">
                  <span className="font-bold">
                    {date.toLocaleDateString("en-US", { day: "numeric" })}
                  </span>{" "}
                  <span>
                    {date.toLocaleDateString("en-US", { month: "short" })}
                  </span>
                </div>

                {todoCount > 0 && (
                  <div className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium bg-green-400">
                    <p className="cursor-pointer peer">{todoCount}</p>
                    <p className="w-[100px] p-1 bg-gray-300 z-1 absolute left-4 top-4 rounded-2xl invisible peer-hover:opacity-100 peer-hover:visible transition-all">
                      Total todo
                    </p>
                  </div>
                )}

                {incompleteCount > 0 && (
                  <div className="absolute bottom-0 -right-2 w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium bg-red-300">
                    <p className="cursor-pointer peer">{incompleteCount}</p>
                    <p className="w-[100px] p-1 bg-gray-300 z-1 absolute left-4 -top-4 rounded-2xl invisible peer-hover:opacity-100 peer-hover:visible transition-all">
                      incomplete todo
                    </p>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
      <button
        onClick={() => {
          const newDate = new Date(selectedDate);
          newDate.setDate(selectedDate.getDate() + 1);
          setSelectedDate(newDate);
        }}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DateCarousel;
