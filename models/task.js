const mongoose = require('mongoose');
const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String, 
    default: "not done"
  },
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
  deadline: String,
  notes: String //notes are additional information about the status of the task. 
  //Ex. Notes: Encountered a bug. Skipping this task for some time.
})


module.exports = mongoose.model('tasks', Schema)
