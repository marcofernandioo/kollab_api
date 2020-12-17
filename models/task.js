const mongoose = require('mongoose');

const Schema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  status: {
    type: String, 
    default: "notdone"
  },
  createDate: {
    type: Date,
    default: Date.now
  },
  deadline: String,
  notes: String, //notes are additional information about the status of the task. 
                 //Ex. Notes: Encountered a bug. Skipping this task for some time.
  doBy: String,
  doId: mongoose.Schema.Types.ObjectId, // doId is the member's id
  assignerId: mongoose.Schema.Types.ObjectId
})


module.exports = mongoose.model('tasks', Schema)
