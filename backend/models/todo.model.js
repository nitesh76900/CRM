const mongoose = require('mongoose');

// Create a schema for the Todo model
const todoSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'User reference is required'],
        },
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: [true, 'Company reference is required'],
        },
        title: {
            type: String,
            required: [true, 'Title is required'],
            minlength: [3, 'Title must be at least 3 characters long'],
            maxlength: [100, 'Title must not exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            minlength: [5, 'Description must be at least 5 characters long'],
        },
        dueDate: {
            type: Date,
            required: [true, 'Due date is required'],
        },
        priority: {
            type: String,
            enum: {
                values: ['High', 'Medium', 'Low'],
                message: 'Priority must be one of: High, Medium, Low',
            },
            default: 'Medium',
        },
        status: {
            type: String,
            enum: ["ToDo", "Conclusion", "Remark"],
            default: "ToDo"
        },
        conclusion: {
            type: String,
            trim: true,
        },
        conclusionSubmiteTime: {
            type: Date,
        },
        remark: {
            type: String,
            trim: true,
        }
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);


// Create and export the model
const Todo = mongoose.model('Todo', todoSchema);
module.exports = Todo;
