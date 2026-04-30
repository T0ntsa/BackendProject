const { default: mongoose } = require("mongoose");

const dogSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  breed: { 
    type: String,  
    trim: true 
  },
  age: { 
    type: Number,
    required: true
  },
  owner: { 
    type: String,  
    trim: true 
  },
  photo: { 
    type: String   // Maybe
  },
  notes: { 
    type: String   
  },
  addedBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User'    
  }
}, { timestamps: true });


dogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Dog', dogSchema)