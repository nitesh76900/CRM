const CustomAlert = ({
  show,
  message,
  type,
  onClose,
  showCancel,
  onConfirm,
}) => {
  if (!show) return null;

  const bgColor = {
    info: "bg-blue-50 border-blue-400 text-blue-700",
    success: "bg-green-50 border-green-400 text-green-700",
    warning: "bg-yellow-50 border-yellow-400 text-yellow-700",  
    error: "bg-red-50 border-red-400 text-red-700",
  }[type];

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(); // Execute the confirmation action
      onClose(); // Close the alert
    } else {
      onClose(); // Just close if no confirmation action
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-gray-500/40">
      <div
        className={`p-4 rounded-lg shadow-lg border-l-4 ${bgColor} max-w-md`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-sm">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-gray-600 hover:text-gray-800"
          >
            ×
          </button>
        </div>
        <div className="mt-3 flex justify-end space-x-2">
          {showCancel && (
            <button
              onClick={onClose}
              className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
            >
              Cancel
            </button>
          )}
          <button
            onClick={handleConfirm}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
