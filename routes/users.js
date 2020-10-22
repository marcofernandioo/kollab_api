var express = require('express');
var app = express.Router();
var Account = require('../models/account');
var Member = require('../models/member');
var crypto = require('crypto');
var async = require('async');
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

//Login (by Account)
router.post('/login', (req,res) => {
    if (req.body && req.body.email && req.body.password){
        let userData = null;
        async.waterfall([
            function (getUserCallback) {
                Account.findOne({email: req.body.email}, (err,data) => {
                    if (!err){
                        if (!data) {
                            getUserCallback('Invalid Email');
                        } else {
                            userData = data;
                            getUserCallback(null)
                        }
                    } else {
                        getUserCallback(err);
                    }
                });
            }, 
            function (checkPasswordCallback) {
                // let hash = userData.hash;
                // let secret = userData.hash;
                // const thisHash = crypto.createHmac('sha256', secret).update(req.body.password).digest('hex');
                if (req.body.password == userData.password){
                    checkPasswordCallback(null)
                } else {
                    checkPasswordCallback('Incorrect Password');
                }
            }
        ], (err) => {
            if (!err) {
                req.session.email = req.body.email
                req.session.fullName = userData.fullName
                res.json({status: 'ok'});
            } else {
                res.json({status: 'error', error: err})
            }
        })
    } else {
        res.json({status: 'error', msg: 'Please Enter a Valid Form'})
    }
})

//Logout
router.get('/logout', (req,res) => {
    if (req.session && req.session.fullName) {
        req.session.destroy();
        res.json({status: 'ok', message: "you kinda kick yourself out"});
    }
    
})

//Check Login
router.get('/check', (req,res) => {
    if (req.session && req.session.fullName) {
        res.json({msg: 'Logged in!', email: req.session.email, fullname: req.session.fullName})
    } else {
        res.json({msg: 'eh.. you kinda did something wrong'})
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