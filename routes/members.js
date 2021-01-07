var express = require('express');
var Account = require('../models/account');
var Member = require('../models/member');
var Team = require('../models/team');
var async = require('async');
var permission = require('../systems/permission');
var router = express.Router();

//Join a Team as a Member
router.post('/join', (req,res) => {
    if (permission.isLoggedIn(req)) { //Currently, everyone can invite any Accounts to be a member.
        if (req.body && req.body.position && req.body.teamId) {

            var new_member = new Member({
                account: req.session.accountId,
                position: req.body.position,
                accountName: req.session.fullName
            })
    
            new_member.save((err,member) => { //Save the Member data.
                if (!err) {
                    async.waterfall([
                        function (pushMemberList) { //push Member to Account's Member List.
                            Account.findOneAndUpdate({_id: req.body.account}, { $push: {member: member}}, (err) => { 
                                if (!err) pushMemberList(null);
                                else pushMemberList(err);
                            })
                        },
                        function (pushTeamList) {
                            Team.findOneAndUpdate({_id: req.body.teamId} , { $push: {members:member}}, (err) => {
                                if (!err) pushTeamList(null);
                                else pushTeamList(err);
                            })
                        }
                    ], (err) => {
                        if (!err) res.json({status: 'ok', msg: 'Member Created!'})
                        else res.json({status: 'error', msg: err.message})
                    })
                }
                else res.json({status: 'error', msg: err.message})
            })
    
        } else {
            res.json({status:'error', msg: 'Please Enter a Valid Form'})
        }
    } else {
        res.json({status: 'error', msg: 'Please Log In'})
    }
    
})

//Search a Member
router.get('/search', (req,res) => {
    if (req.query.id) {
        Member.findById(req.query.id, (err,data) => {
            if (!err) {
                if (data) {
                    res.json({status: 'ok', data})
                } else {
                    res.json({status: 'error', msg: 'Member Not Found'})
                }
            } else {
                res.json({status: 'error', msg: err})
            }
        })
    }
})

//Leave a Team/Group.
router.get('/leave', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.query && req.query.memberId) {
            async.waterfall([
                function (callback) { //Find the member based on the inputted memberId
                    Member.findById(req.query.memberId, (err,member) => {
                        if (!err) {
                            if (member) {
                                callback(null, member);
                            } else {
                                callback('Member Not Found!');
                            }
                        } else {
                            callback(err);
                        }
                    })
                }, 
                function (member, callback) {
                    if (member.account == req.session.accountId) { //Check if the found member belongs to the logged in Account or not.
                        //The found member belongs to the logged in Account.
                        callback(null, member);
                    } else {
                        //The found member doesn't belong to the logged in Account.
                        callback('You don\'t have permission to delete this member');
                    }
                },
                // function ()
            ], function (err,data) {
                if (!err) {
                    data.remove((err) => {
                        if (err) res.json({status: 'error', msg: err});
                        else {
                            Account.findByIdAndUpdate(req.session.accountId, { $pull: {member: req.query.memberId}}, { safe: true, upsert: true }, (err) => {
                                if (!err) {
                                  res.json({status: 'ok', msg: 'Member Successfully Deleted'})
                                } else {
                                  res.json({status: 'error', msg: err.message});
                                }
                            })
                        }
                    })
                    
                } else {
                    res.json({status: 'error', msg: err})
                }
            })
        } else {
            res.json({status: 'error', msg: 'Invalid form'});
        }
    } else {
        res.json({status: 'error', msg: 'Not Logged In!'});
    }
})

//Leave a team

// 1. Check if the inputted member exists.
// 2. Check if the inputted member belongs to the same current logged in Account.
// 3. Delete the member
// 1F. return error
// 2F. return error  

module.exports = router;