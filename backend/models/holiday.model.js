const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: [true, "Date is required"]
    },
    name: {
        type: String,
        required: [true, "holiday name is required"]
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
        required: [true, "Company reference is required"],
    },
});

const Holiday = mongoose.model("Holiday", holidaySchema);
module.exports = Holiday