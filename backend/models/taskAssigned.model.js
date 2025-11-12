const mongoose = require('mongoose');

const taskAssignedSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, 'Company reference is required'],
        },
        title: {
            type: String,
            required: [true, 'Task title is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Task description is required'],
            trim: true,
        },
        priority: {
            type: String,
            enum: ['High', 'Medium', 'Low'],
            default: 'Medium',
        },
        isEdit: {
            type: Boolean,
            default: false
        },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Assigned employee reference is required'],
        },
        assignedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Assigning user reference is required'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        conclusion: {
            type: String,
            trim: true,
        },
        conclusionSubmitTime: {
            type: Date,
        },
    },
    { timestamps: true }
);

const TaskAssigned = mongoose.model('TaskAssigned', taskAssignedSchema);
module.exports = TaskAssigned;
