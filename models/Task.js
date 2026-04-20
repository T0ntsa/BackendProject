const mongoose = require('mongoose'); 

const taskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true, 
        trim: true 
    },
    description: { 
        type: String 
    },
    dog: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Dog', 
        required: true   
    },
    assignedTo: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true   
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true   
    },
    status: { 
        type: String, 
        enum: ['pending', 'in_progress', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    },
    dueDate: { 
        type: Date 
    },
    completedAt: { 
        type: Date 
    }
}, { timestamps: true });


module.exports = mongoose.model("Task", taskSchema); 