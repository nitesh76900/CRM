const mongoose = require('mongoose');

const contactsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true,
    },
    phoneNo: {
      type: String,
      match: [/^\d{10,15}$/, 'Phone number must be between 10 to 15 digits'],
      required: [true, 'Contact Phone number is required'],
    },
    email: {
      type: String,
      // required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    address: {
      country: { type: String },
      state: { type: String },
      city: { type: String },
      pincode: {
        type: String,
        match: [/^\d{4,10}$/, 'Pincode must be between 4 to 10 digits'],
      },
    },
    businessCard: {
      public_id: { type: String },
      url: { type: String },
    },
    isClient: {
      type: Boolean,
      default: false
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
  },
  { timestamps: true }
);

const Contacts = mongoose.model('Contacts', contactsSchema);
module.exports = Contacts;