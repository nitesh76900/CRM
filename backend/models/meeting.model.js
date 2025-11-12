const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Meeting title is required'],
      trim: true,
    },
    addressAndLink: {
      type: String,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'At least one participant is required'],
      },
    ],
    forLead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead'
    },
    scheduledTime: {
      type: Date,
      required: [true, 'Scheduled time is required'],
    },
    agenda: {
      type: String,
      required: [true, 'Meeting agenda is required'],
      trim: true,
    },
    addParticipants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Contacts',
      },
    ],
    meetingStatus:{
      type: String,
      enum: ["Pending", "Complete", "Cancel"],
      default: "Pending"
    },
    conclusion: { 
      type: String, 
      trim: true 
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
  },
  { timestamps: true }
);

const Meeting = mongoose.model('Meeting', meetingSchema);
module.exports = Meeting;