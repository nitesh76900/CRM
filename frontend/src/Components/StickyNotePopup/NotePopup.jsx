import React, { useState, useRef, useEffect } from "react";
import { addStickyNote } from "../../services/stickyNotesServices";

const NotePopup = ({ isOpen, onClose, type }) => {
  const [message, setMessage] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const popupRef = useRef(null);
  const messageInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        onClose();
      }
    };

    const handleEscKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError("");

    try {
      const noteData = {
        type,
        message: message.trim(),
        ...(url && { url: url.trim() }),
      };

      await addStickyNote(noteData);
      setMessage("");
      setUrl("");
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save note. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500/40 bg-opacity-40 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        ref={popupRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transition-all duration-300 ease-in-out transform"
        style={{
          animation: "popup-appear 0.3s forwards",
        }}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2
              className={`text-xl font-bold flex items-center ${
                type === "reminder" ? "text-amber-600" : "text-blue-600"
              }`}
            >
              <span className="mr-2">{type === "reminder" ? "⏰" : "👥"}</span>
              Notes
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                id="message"
                ref={messageInputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  type === "reminder"
                    ? "What do you need to remember?"
                    : "Enter meeting details..."
                }
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  type === "reminder"
                    ? "focus:ring-amber-300 focus:border-amber-400"
                    : "focus:ring-blue-300 focus:border-blue-400"
                } resize-none transition-all`}
                rows="4"
                maxLength={500}
                required
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {message.length}/500 characters
              </p>
            </div>

            {/* <div className="mb-5">
              <label
                htmlFor="url"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                URL (optional)
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Add a relevant link..."
                className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 ${
                  type === "reminder"
                    ? "focus:ring-amber-300 focus:border-amber-400"
                    : "focus:ring-blue-300 focus:border-blue-400"
                } transition-all`}
              />
            </div> */}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 transition-all ${
                  type === "reminder"
                    ? "bg-amber-500 hover:bg-amber-600 focus:ring-amber-300"
                    : "bg-blue-500 hover:bg-blue-600 focus:ring-blue-300"
                } ${
                  isSubmitting || !message.trim()
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  `Save ${type === "reminder" ? "Reminder" : "Meeting Note"}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes popup-appear {
          from {
            opacity: 0;
            transform: scale(0.95) translateY(-10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default NotePopup;
