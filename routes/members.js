var express = require('express');
var Account = require('../models/account');
var Member = require('../models/member');
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

module.exports = router;