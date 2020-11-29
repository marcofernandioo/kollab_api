var express = require('express')
var Task = require('../models/task');
var router = express.Router();
var async = require('async');
var permission = require('../systems/permission');
const Member = require('../models/member');
const Account = require('../models/account');

//Display all tasks of a member/account 
router.get('/all/:id/', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.params && req.params.id) {
      Task.find({doId: req.params.id}, (err,data) => {
        if (!err) {
          if (data) {
            res.json({status: 'ok', data:data});
          } else {
            res.json({status: 'error', msg: 'User with this member id not found'})
          }
        } else {
          res.json({status: 'error', msg: err})
        }
      })
    } else {
      res.json({status: 'error', msg: 'Invalid param'});
    }
  } else {
    res.json({status: 'error', msg: 'Not logged in!'});
  }

});

//Find Task by ID
router.get('/find/:id', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.params.id) {
      Task.findById(req.params.id, (err,data) => {
        if (!err) res.json({data:data})
        else res.json({err: err.message})
      })
    } else {
      res.json({status: 'error',msg: 'Enter Valid URL'})
    }
  } else {
    res.json({status: 'error', msg: 'Not Logged In!'});
  } 
})

//Display Task by status 
router.get('/filter/:done/:doing', (req,res) => {
  if (permission.isLoggedIn(req)) {
    //Display Done/Not Done Tasks
    if (req.query && req.query.done != null) {
      Task.find({done: req.query.done}, (err,tasks) => {
        if (!err) res.json({tasks})
        else res.json({status: 'error', msg: err.message})
      })

    //Display 'Doing' Tasks
    } else if (req.query && req.query.doing) {
      Task.find({doing: req.query.doing}, (err,tasks) => {
        if (!err) res.json({tasks})
        else res.json({status: 'error', msg: err.message})
      })
    } else {
      res.json({status: 'error', msg: 'Enter Valid URL'})
    }
  } else {
    res.json({status: 'error', msg: 'Not Logged In!'});
  }
  
})

//Create a personal task 
router.post('/create/account', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.body && req.body.title) {
    
      var new_task = new Task({
        title: req.body.title, 
        description: req.body.description,
        status: req.body.status,
        createDate: Date.now(),
        deadline: req.body.deadline,
        doBy: req.session.fullName,
        doId: req.session.accountId
      })

      //res.json({status: 'ok', msg: 'Task Added'})

      new_task.save((err,data) => {
        if (!err) {
          if (data) {
            Account.findOneAndUpdate({_id: req.session.accountId}, { $push: {personalTasks: data}}, (err) => {
              if (!err) {
                res.json({status: 'ok', msg: 'Task Created'});
              } else {
                res.json({status: 'error', msg: err});
              }
            });
          } else {
            res.json({status: 'error', msg: 'Task Not Found'});
          }
        } else {
          res.json({status: 'error', msg: err})
        }
      })

    } else {
      res.json({status: 'error', msg: 'Enter a Valid Form'})
    }
  } else {
    res.json({status: 'error', msg: 'Not Logged In!'})
  }
})

//Create a team task
router.post('/create/member', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.body && req.body.title) {

    }
  } else {
    res.json({status: 'error', msg: 'Not Logged In!'})
  }
})

//Delete a personal task
router.delete('/delete', (req,res) => {
  if (permission.isLoggedIn(req)) {
    //Also implement the permission.edit system.
    if (req.query && req.query.taskId) {
      async.waterfall([ //Only Done task(s) could be deleted.
        //1. Find the Task and check if current account can delete this task.
        function (callback) {
          Task.findById(req.query.taskId, (err,task) => {
            if(!err && task) {
              if (task.doId == req.session.accountId) { //Only proceed if the Task is owned by the logged in Account.
                callback(null, task)
              } else {
                callback("You don't have permission to delete this task");
              }
            }
            else callback(err);
          })
        }, 
  
        //2. Check if the Task is Completed or not
        function (task, callback) {
          if (task.done) callback(null, task)
          else callback("Task isn't Done, Complete This Task Before Deleting")
        }
  
      ], function(err,data){
        if (!err){
          data.remove((err) => {
            if (err) res.json({status: 'error', msg: err.message})
            else {
              Account.findByIdAndUpdate(req.session.accountId, { $pull: {personalTasks: req.query.taskId}}, { safe: true, upsert: true }, (err) => {
                if (!err) {
                  res.json({status: 'ok', msg: 'Task Successfully Deleted'})
                } else {
                  res.json({status: 'error', msg: err});
                }
              })
            }
            
          })
        } else {
          res.json({status: 'error', msg: err})
        }
      })
    } else {
      res.json({status: 'error',msg: 'You forgot to enter the taskId'})
    }
  } else {
    res.json({status: 'error', msg: 'Not logged in!'});
  }
   
})

//Edit a task
router.put('/update', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.body && req.body.id && (req.body.title || req.body.description || req.body.status || req.body.deadline || req.body.notes)){
      let newTask = {}
  
      if (req.body.title) newTask.title = req.body.title //Edit title
      if (req.body.description) newTask.description = req.body.description; //Edit description
      //Edit status. Doing and Done are also being editted automatically.
      if (req.body.status && req.body.status === 'done'){
        newTask.doing = false
        newTask.done = true
        newTask.status = req.body.status
      } else if (req.body.status && req.body.status === 'doing') {
        newTask.doing = true
        newTask.done = false
        newTask.status = req.body.status
      } else if (req.body.status && req.body.status === 'pending') {
        newTask.doing = false
        newTask.done = false
        newTask.status = req.body.status
      }
      if (req.body.deadline) newTask.deadline = req.body.deadline //Update deadline
      if (req.body.notes) newTask.notes = req.body.notes
  
      Task.findOneAndUpdate({_id:req.body.id}, newTask, (err) => {
        if (!err) res.status(200).json({message: 'Task Updated!'})
        else res.status(500).json({msg: err.message})
      })
  
    } else {
      res.status(400).json({msg: 'Enter a VALID form'})
    }
  } else {
    res.json({status: 'error', msg: 'Not logged in!'});
  }
  
})

//Assign a task to a specific Member
router.post('/assign', (req,res) => {
  if (req.body && req.body.memberId && req.body.title) {
    async.waterfall([
      function (saveData) {
        var task = {};
        task.title = req.body.title;
        task.description = req.body.desc;
        task.deadline = req.body.deadline;
        task.notes = req.body.notes;
        saveData(null, task);
      }, 
      function (task, updateTask) {
        Member.findByIdAndUpdate(req.body.memberId, { $push: {tasks: task}}, (err) => {
          if(!err) {
            updateTask(null);
          } else {
            updateTask(err);
          }
        })
      }
    ], (err) => {
      if (err) {
        res.json({status: 'error', msg: err})
      } else {
        res.json({status: 'ok', msg: 'Task Assigned'})
      }
      
    });
  } else {
    res.json({status: 'error', msg: 'Invalid Form'})
  }
})

module.exports = router