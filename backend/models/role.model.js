const mongoose = require('mongoose');

// Create a schema for the Role model
const roleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            minlength: [3, 'Role name must be at least 3 characters long'],
            maxlength: [50, 'Role name must not exceed 50 characters'],
        },
        permissions: {
            leads: {
                create: { type: Boolean, default: false },
                read: { type: Boolean, default: false },
                update: { type: Boolean, default: false },
                delete: { type: Boolean, default: false },
            },
            tasks: {
                create: { type: Boolean, default: false },
                read: { type: Boolean, default: false },
                update: { type: Boolean, default: false },
                delete: { type: Boolean, default: false },
            },
            meeting: { 
                create: { type: Boolean, default: false },
                read: { type: Boolean, default: false },
                update: { type: Boolean, default: false },
                delete: { type: Boolean, default: false },
            },
            todos: {
                read: { type: Boolean, default: false },
            },
            attendance: {
                create: { type: Boolean, default: false },
                read: { type: Boolean, default: false },
            }
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: [true, 'Employee reference is required'],
        },
    },
    {
        timestamps: true, // Automatically adds createdAt and updatedAt fields
    }
);

// Create and export the model
const Role = mongoose.model('Role', roleSchema);
module.exports = Role;
