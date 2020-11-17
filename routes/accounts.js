var express = require('express');
var app = express.Router();
var Account = require('../models/account');
var permission = require('../systems/permission');
var crypto = require('crypto');
var async = require('async');
var router = express.Router();

//Create an Account.
router.post('/create', (req,res) => {
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

//Search an Account.
router.get('/search', (req,res) => {
    if (req.query.id) {
        Account.findById(req.query.id, (err,data) => {
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

//Login
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
                req.session.email = userData.email
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
    if (permission.isLoggedIn(req)) {
        res.json({msg: 'Logged in!', email: req.session.email, fullname: req.session.fullName})
    } else {
        res.json({msg: 'eh.. you kinda did something wrong'})
    }
})

module.exports = router