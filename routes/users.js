var express = require('express');
var app = express.Router();
var Account = require('../models/account');
var Member = require('../models/member');
var router = express.Router();

//Create an Account.
router.post('/create/account', (req,res) => {
    if (req.body && req.body.fullName && req.body.email && req.body.password ) {
        
        var new_account = new Account({
            fullName: req.body.fullName, 
            email: req.body.email,
            password: req.body.password,
        })

        new_account.save((err) => {
            if (!err) res.json({status: 'ok', message: 'Account Created'})
            else res.json({status: 'error', message: err.message})
        })

    } else {
        res.json({status: 'error', msg: 'Please Enter a Valid Form'})
    }
})

//Create a Member
router.post('/create/member', (req,res) => {
    if (req.body && req.body.account && req.body.position) {

        var new_member = new Member({
            account: req.body.account,
            position: req.body.position
        })

        new_member.save((err,saved) => {
            if (!err) {
                Member.findOneAndUpdate({_id: req.body.account}, { $push: {member: saved}}, (err) => {
                    if (!err) res.json({status: 'ok', message: 'Member Created!'})
                    else res.json({status: 'error', message: err.message})
                })
            }
            else res.json({status: 'error', message: err.message})
        })

        //Add new Member to corresponding Account's list of member array.
        

    } else {
        res.json({status:'error', msg: 'Please Enter a Valid Form'})
    }
})




module.exports = router