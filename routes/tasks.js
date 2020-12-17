var express = require('express')
var Task = require('../models/task');
var router = express.Router();
var async = require('async');
var permission = require('../systems/permission');
const Member = require('../models/member');
const Account = require('../models/account');

//Display all personal tasks
router.get('/all', (req,res) => {
  if (permission.isLoggedIn(req)) {
    Task.find ({doId: req.session.accountId}, (err,tasks) => {
      if (!err) {
        res.json({status: 'ok', tasks: tasks});
      } else {
        res.json({status: 'error', msg: err.message});
      }
    })
  } else {
    res.json({status: 'error', msg: 'Not logged in!'});
  }

});

//For client-side testing purposes only: Display all tasks
router.get('/alltasks', (req,res) => {
  
  Task.find({}, (err,tasks) => {
    if (!err) {
      res.json({status: 'ok', tasks});
    } else {
      res.json({status: 'error', msg: err});
    }
  })
})

//Find Task by ID -> Change to find by Title
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

//Display Task by status  -> Fix this. (Halt this endpoint, use the other ones)
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

//Display Task by status: whether the task is doing, done, or notdone.

//Display Done Task
router.get('/done', (req,res) => {
  if (permission.isLoggedIn(req)) {

    Task.find({doId: req.session.accountId, done: true}, (err,tasks) => {
      if (!err) {
        if (tasks) {
          res.json({status: 'ok', tasks: tasks})
        } else {
          res.json({status: 'error', msg: 'Task not found!'});
        }
      } else {
        res.json({status: 'error', msg: err.message})
      }
    })
  } else {
    res.json({status: 'error', msg: 'Not logged in'})
  }
})

//Display Doing Task
router.get('/doing', (req,res) => {
  if (permission.isLoggedIn(req)) {
    Task.find({doId: req.session.accountId, doing: true}, (err,tasks) => {
      if (!err) {
        if (tasks) {
          res.json({status: 'ok', tasks: tasks})
        } else {
          res.json({status: 'error', msg: 'Task not found!'});
        }
      } else {
        res.json({status: 'error', msg: err.message})
      }
    })
  } else {
    res.json({status: 'error', msg: 'Not logged in'})
  }
})

//Create a personal task -> Button
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
router.post('/assign/member', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.body && req.body.title && req.body.id) {

      async.waterfall([
        function (findMember) {
          Member.findById(req.body.id, (err,member) => {
            if (!err) {
              if (data) {
                findMember(null, member.accountName);
              } else {
                findMember('Member not found');
              }
            } else {
              findMember(err);
            }
          })
        }, 
        function (accountName, createAndSaveTask) {
          var new_task = new Task({
            title: req.body.title, 
            description: req.body.description,
            status: req.body.status,
            createDate: Date.now(),
            deadline: req.body.deadline,
            doBy: accountName,
            doId: req.body.id
          })
    
          new_task.save((err,data) => {
            if (!err) {
              if (data) {
                Member.findOneAndUpdate({_id: req.session.accountId}, { $push: {personalTasks: data}}, (err) => {
                  if (!err) {
                    // res.json({status: 'ok', msg: 'Task Created'});
                    createAndSaveTask(null);
                  } else {
                    // res.json({status: 'error', msg: err});
                    createAndSaveTask(err);
                  }
                });
              } else {
                // res.json({status: 'error', msg: 'Task Not Found'});
                createAndSaveTask();
              }
            } else {
              // res.json({status: 'error', msg: err})
              createAndSaveTask();
            }
          })
        }
      ], (err) => {

      });
    
      

    } else {
      res.json({status: 'error', msg: 'Enter a Valid Form'})
    }
  } else {
    res.json({status: 'error', msg: 'Not Logged In!'})
  }
})

//Delete a personal task
router.delete('/delete/:id', (req,res) => {
  if (permission.isLoggedIn(req)) {
    //Also implement the permission.edit system.
    if (req.params.id) {
      async.waterfall([ //Only Done task could be deleted.
        //1. Find the Task and check if current account can delete this task.
        function (callback) {
          Task.findById(req.params.id, (err,task) => {
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
          if (task.status == 'done') callback(null, task)
          else callback("Task isn't Done, Complete This Task Before Deleting")
        }
  
      ], function(err,data){
        if (!err){
          data.remove((err) => {
            if (err) res.json({status: 'error', msg: err.message})
            else {
              Account.findByIdAndUpdate(req.session.accountId, { $pull: {personalTasks: req.params.id}}, { safe: true, upsert: true }, (err) => {
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
      res.json({status: 'error',msg: 'You forgot to enter the task id'})
    }
  } else {
    res.json({status: 'error', msg: 'Not logged in!'});
  }
   
})

//Delete All DONE Tasks.
router.get('/deletedone', (req,res) => {
  if (permission.isLoggedIn(req)) {
    Task.deleteMany({doId: req.session.accountId, status: 'done'}, (err) => {
      if (!err) {
        res.json({status: 'ok', msg: 'Tasks successfully deleted'})
      } else {
        res.json({status: 'error', msg: err.message})
      }
    })
  } else {
    res.json({status: 'error', msg: 'Not logged in'})
  }
})

//Edit a personal task
router.put('/update', (req,res) => {
  if (permission.isLoggedIn(req)) {
    if (req.body && req.body.id && (req.body.title || req.body.description || req.body.status || req.body.deadline || req.body.notes)){
      async.waterfall([
        function (findTask) {
          Task.findById(req.body.id, (err,task) => {
            if (!err) {
              if (task) {
                findTask(null,task);
              } else {
                findTask('Task not found.')
              }
            } else {
              findTask(err);
            }
          })
        },
        function (task, checkUpdateEligibility) {
          if (task.doId == req.session.accountId) {
            checkUpdateEligibility(null);
          } else {
            checkUpdateEligibility('You don\'t have permission to update this task');
          }
        }
      ], (err) => {
        if (!err) {
          let newTask = {}
          if (req.body.title) newTask.title = req.body.title //Edit task title
          if (req.body.description) newTask.description = req.body.description; //Edit task description
          if (req.body.status && req.body.status === 'done'){ //Edit status. Doing and Done are also being editted automatically.
            
          }
          if (req.body.deadline) newTask.deadline = req.body.deadline //Edit deadline
          if (req.body.notes) newTask.notes = req.body.notes // Edit task notes

          Task.findOneAndUpdate({_id:req.body.id}, newTask, (err) => {
            if (!err) res.json({status: 'ok', message: 'Task Updated!'})
            else res.json({status: 'error', msg: err.message})
          })
        } else {
          res.json({status: 'error', msg: err});
        }
      });
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

//Update a personal task status
router.get('/updatestatus', (req,res) => {
  if (permission.isLoggedIn(req)) {
    
    async.waterfall([
      function (findTask) {
        Task.findById(req.query.id, (err,task) => {
          if (!err) {
            if (task) findTask(null);
            else findTask('Please try again later'); 
          } else {
            findTask(err);
          }
        })
      }, 
      function (callback) {
        let new_task = {};
        new_task.status = req.query.status;
        Task.findByIdAndUpdate(req.query.id, new_task, (err) => {
          if (!err) callback(null);
          else callback(err);
        })
      }
    ], (err) => {
      if (!err) res.json({status: 'ok', msg: 'task status updated'});
      else res.json({status: 'error', msg: err})
    })
    
  } else {
    res.json({status: 'error', msg: 'Not logged in'})
  }
})

//Update a Team task status

module.exports = router