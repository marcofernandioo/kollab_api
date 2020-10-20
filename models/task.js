const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  done: {
    type: Boolean,
    default: false
  },
  doing: {
    type: Boolean, 
    default: false
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  deadline: String
})


module.exports = mongoose.model('tasks', Schema)
