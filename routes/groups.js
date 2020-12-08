var express = require('express');
var permission = require('../systems/permission');
var async = require('async');
const Team = require('../models/team');
const Group = require('../models/group');
var router = express.Router();

//Create a Group
router.post('/create', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.id && req.body.groupName) {
            async.waterfall([
                function (checkTeamExists) {
                    Team.findById(req.body.id, (err,team) => {
                        if (!err) {
                            if (team) checkTeamExists(null, team)
                            else checkTeamExists('Please try again later');
                        }
                        else checkTeamExists(err);
                    })
                }, 
                function (team, checkAccountIsOwner) {
                    if (team.teamOwnerId == req.session.accountId) checkAccountIsOwner(null,team);
                    else checkAccountIsOwner('No permission to create a Group');
                }, 
                function (team,createGroup) {
                    var new_group = new Group({
                        teamId: team._id, 
                        teamName: team.teamName, 
                        groupName: req.body.groupName, 
                        taskLimit: req.body.taskLimit
                    });
                    new_group.save((err, group) => {
                        if (!err) createGroup(null, group);
                        else createGroup(err);
                    })
                }, 
                function (group, pushGroupToTeamList) {
                    Team.findByIdAndUpdate(req.body.id, { $push: {groups: group._id}}, (err) => {
                        if (!err) pushGroupToTeamList(null)
                        else pushGroupToTeamList(err);
                    })
                }
            ], (err) => {
                if (!err) res.json({status: 'ok', msg: 'Group is created'});
                else res.json({status: 'erroor', msg: err});
            })
        } else {
            res.json({status: 'error', msg: 'Please enter a valid form'})
        }
        
    } else {
        res.json({status: 'error', msg: 'Not logged in'});
    }
})

//Delete a Group
router.get('/delete', (req,res) => {
    if (permission.isLoggedIn(req)) {
            async.waterfall([
                function (findTeam) {
                    Team.findById(req.query.teamId, (err,team) => {
                        if (!err) {
                            if (team) findTeam(null, team);
                            else findTeam('Please try again later');
                        } else {
                            findTeam(err);
                        }
                    })
                }, 
                function (team, checkIsOwner) {
                    if (team.teamOwnerId == req.session.accountId) checkIsOwner(null)
                    else checkIsOwner('No permission to delete this group')
                }, 
                function (deleteGroup) {
                    Group.findOneAndDelete({_id: req.query.groupId}, (err) => {
                        if (!err) deleteGroup(null);
                        else deleteGroup(err);
                    })
                },
                function (pullTeamList) {
                    Team.findByIdAndUpdate(req.query.teamId, { $pull: {groups: req.query.groupId}}, (err) => {
                        if (!err) pullTeamList(null);
                        else pullTeamList(err);
                    })
                }
            ], (err) => {
                if (!err) res.json({status: 'ok', msg: 'Group deleted'});
                else res.json({status: 'error', msg: err});
            })
    } else {
        res.json({status: 'error', msg: 'Not logged in'});
    }
})

module.exports = router;