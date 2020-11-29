var express = require('express');
var Account = require('../models/account');
var Member = require('../models/member');
var async = require('async');
var permission = require('../systems/permission');
var router = express.Router();

//Create a Member
router.post('/create', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.account && req.body.position) {

            var new_member = new Member({
                account: req.body.account,
                position: req.body.position,
                accountName: req.session.fullName
            })
    
            new_member.save((err,saved) => {
                if (!err) {
                    Account.findOneAndUpdate({_id: req.body.account}, { $push: {member: saved}}, (err) => {
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
                    res.json({status: 'error', msg: 'Not Found'})
                }
            } else {
                res.json({status: 'error', msg: err})
            }
        })
    }
})

//Delete a Member
router.get('/delete', (req,res) => {
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
                }
            ], function (err,data) {
                if (!err) {
                    data.remove((err) => {
                        if (err) res.json({status: 'error', msg: err});
                        else {
                            Account.findByIdAndUpdate(req.session.accountId, { $pull: {member: req.query.memberId}}, { safe: true, upsert: true }, (err) => {
                                if (!err) {
                                  res.json({status: 'ok', msg: 'Member Successfully Deleted'})
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