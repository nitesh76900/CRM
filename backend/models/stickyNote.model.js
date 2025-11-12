const mongoose = require("mongoose");

const stickyNoteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
    type: {
      type: String,
      enum: ["reminder", "meeting"],
      required: [true, "Type is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      minlength: [3, "Message must be at least 3 characters long"],
      maxlength: [500, "Message cannot exceed 500 characters"],
    },
    url: {
      type: String,
    },
  },
  { timestamps: true }
);

const StickyNote = mongoose.model("StickyNote", stickyNoteSchema);
module.exports = StickyNote;
