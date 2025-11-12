import React, { useState, useEffect } from "react";
import StickyBox from "react-sticky-box";
import { Trash2 } from "lucide-react";
import {
  getStickyNotes,
  deleteStickyNote,
} from "../../../services/stickyNotesServices";
import stickyNotesBG from "../bgImage/stickyNotesBG.png";
import { Tooltip } from "react-tooltip";

const StickyNotes = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const response = await getStickyNotes();
      if (response.success) {
        setNotes(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id) => {
    try {
      await deleteStickyNote(id);
      // After successful deletion, update the UI
      setNotes((prevNotes) => prevNotes.filter((note) => note._id !== id));
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  // Function to format title and description from message
  const formatNoteContent = (message) => {
    if (message.includes(" - Scheduled for:")) {
      const [title, description] = message.split(" - Scheduled for:");
      return {
        title: title,
        description: `Scheduled for: ${description}`,
      };
    }
    return {
      title: message?.length > 50 ? message.substring(0, 50) + "..." : message,
      description: message,
    };
  };

  return (
    <div className="p-4 bg-white shadow rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Sticky Notes</h2>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
        </div>
      ) : (
        <div className="flex gap-5 flex-wrap">
          {notes?.length === 0 ? (
            <p className="text-gray-500 text-center w-full">No sticky notes available.</p>
          ) : (
            notes.map((note) => {
              const { title } = formatNoteContent(note.message);
              return (
                <StickyBox
                  key={note._id}
                  className="w-[150px] h-[150px] p-2 rounded bg-cover bg-center"
                  style={{ backgroundImage: `url(${stickyNotesBG})` }}
                >
                  <div className="flex justify-between items-center">
                    <p className="px-2 rounded-2xl text-[10px] font-bold bg-amber-100 mt-2 text-center">
                      {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                    </p>
                    <button
                      className="hover:text-red-700"
                      data-tooltip-id="delete-note"
                      data-tooltip-content="Delete Sticky Note"
                      onClick={() => deleteNote(note._id)}
                    >
                      <Trash2 size={16} />
                    </button>
                    <Tooltip id="delete-note" />
                  </div>
                  <h1 className="font-bold text-[15px] break-words">{title}</h1>
                </StickyBox>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default StickyNotes;
