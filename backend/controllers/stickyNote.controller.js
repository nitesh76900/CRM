const StickyNote = require("../models/stickyNote.model");

// 📌 **Add a new sticky note**
exports.addStickyNote = async (req, res) => {
    try {
        console.log('req.body', req.body)
        const { type, message, url } = req.body;

        if ( !type || !message) {
            return res.status(400).json({ message: "type, and message are required" });
        }

        const newNote = new StickyNote({ user: req.user._id , type, message, url });
        await newNote.save();

        return res.status(201).json({
            message: "Sticky note added successfully",
            note: newNote,
        });
    } catch (error) {
        console.error("Error adding sticky note:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// 📌 **Delete a sticky note**
exports.deleteStickyNote = async (req, res) => {
    try {
        const { noteId } = req.params;

        if (!noteId) {
            return res.status(400).json({ message: "Note ID is required" });
        }

        const deletedNote = await StickyNote.findOneAndDelete({_id: noteId, user: req.user._id});

        if (!deletedNote) {
            return res.status(404).json({ message: "Sticky note not found" });
        }

        return res.status(200).json({ message: "Sticky note deleted successfully" });
    } catch (error) {
        console.error("Error deleting sticky note:", error);
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

exports.getStickyNotes = async (req, res) => {
    try {
        // Get current user ID from authenticated request
        const userId = req.user._id;

        // Find all sticky notes for this user
        const stickyNotes = await StickyNote.find({ user: userId })
            .sort({ createdAt: -1 }) // Sort by newest first
            .select('-__v'); // Exclude version key

        return res.status(200).json({
            success: true,
            message: "Sticky notes retrieved successfully",
            data: stickyNotes,
            count: stickyNotes.length
        });

    } catch (error) {
        console.error('Error in getStickyNotes:', error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving sticky notes",
            error: error.message
        });
    }
};

// Get sticky notes by type for current user
exports.getStickyNotesByType = async (req, res) => {
    try {
        const { type } = req.params;
        const userId = req.user._id;

        // Validate type parameter
        if (!['reminder', 'meeting'].includes(type)) {
            return res.status(400).json({
                success: false,
                message: "Invalid sticky note type. Must be either 'reminder' or 'meeting'"
            });
        }

        // Find sticky notes of specified type for this user
        const stickyNotes = await StickyNote.find({
            user: userId,
            type: type
        })
            .sort({ createdAt: -1 })
            .select('-__v');

        return res.status(200).json({
            success: true,
            message: `${type} sticky notes retrieved successfully`,
            data: stickyNotes,
            count: stickyNotes.length
        });

    } catch (error) {
        console.error('Error in getStickyNotesByType:', error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving sticky notes",
            error: error.message
        });
    }
};

// Get a single sticky note by ID
exports.getStickyNoteById = async (req, res) => {
    try {
        const { noteId } = req.params;
        const userId = req.user._id;

        // Find specific sticky note for this user
        const stickyNote = await StickyNote.findOne({
            _id: noteId,
            user: userId
        }).select('-__v');

        // Check if note exists
        if (!stickyNote) {
            return res.status(404).json({
                success: false,
                message: "Sticky note not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Sticky note retrieved successfully",
            data: stickyNote
        });

    } catch (error) {
        console.error('Error in getStickyNoteById:', error);
        return res.status(500).json({
            success: false,
            message: "Error retrieving sticky note",
            error: error.message
        });
    }
};