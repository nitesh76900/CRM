const mongoose = require('mongoose');

const leadStatusLabelSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [3, 'Name must be at least 3 characters long'],
    }
  },
  { timestamps: true }
);

const LeadStatusLabel = mongoose.model('LeadStatusLabel', leadStatusLabelSchema);
module.exports = LeadStatusLabel;
