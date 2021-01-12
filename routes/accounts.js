var express = require('express');
var Account = require('../models/account');
var Task = require('../models/task');
var Member = require('../models/member');
var Team = require('../models/team');
var permission = require('../systems/permission');
var crypto = require('crypto');
var async = require('async');
var router = express.Router();


//Create an Account.
router.post('/register', (req,res) => {
    if (req.body && req.body.fullName && req.body.email && req.body.password ) {

        async.waterfall([
            function (checkDuplicateEmail) { //Check if another same email in DB exists, we can't have duplicates
                Account.findOne({email: req.body.email}, (err, data) => {
                    if (!err) {
                        if (data) checkDuplicateEmail('This email has been used, please use a different email');
                        else checkDuplicateEmail(null);
                    }
                    else checkDuplicateEmail();
                })
            }, 
            function (createAccount) { //Create the account
                const key = crypto.randomBytes(16).toString('hex');
                const hashed = crypto.createHmac('sha256', key).update(req.body.password).digest('hex');

                var new_account = new Account({
                    fullName: req.body.fullName, 
                    email: req.body.email,
                    password: hashed,
                    key: key
                })
                createAccount(null, new_account);
            }
        ], (err,data) => {
            // Saving the account to the DB.
            if (!err) {
                if (data) {
                    data.save((err) => {
                        if (!err) res.json({status: 'ok', msg: 'Account Created. Let\'s get movin\', champ!'})
                        else res.json({status: 'error', msg: err.message})
                    })
                } else res.json({status: 'error', msg: 'Please try again later..'})
            } else {
                res.json({status: 'error', msg: err})
            }
        });

        

        

    } else {
        res.json({status: 'error', msg: 'Please Enter a Valid Form'})
    }
})

//Search an Account. Testing only
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
            //1. Get email and password.
            function (getUserCallback) {
                Account.findOne({email: req.body.email}, (err,data) => {
                    if (!err){
                        if (!data) {
                            getUserCallback('Account not found');
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
                //2. Get password and key
                let password = userData.password;
                let key = userData.key;
                //3. Use the previous key to encrypt the inputted password, and store it in thisHash var.
                const thisHash = crypto.createHmac('sha256', key).update(req.body.password).digest('hex');
                //4. Compare this encrypted password to hash
                if (thisHash == password){
                    checkPasswordCallback(null)
                } else {
                    checkPasswordCallback('Incorrect Password');
                }
            }
        ], (err) => {
            if (!err) {
                req.session.email = userData.email;
                req.session.fullName = userData.fullName;
                req.session.accountId = userData._id;
                res.json({status: 'ok', msg: 'Logged in'});
            } else {
                res.json({status: 'error', msg: err});
            }
        })
    } else {
        res.json({status: 'error', msg: 'Please Enter a Valid Form'})
    }
})

//Logout
router.get('/logout', (req,res) => {
    if (permission.isLoggedIn(req)) {
        req.session.destroy();
        res.json({status: 'ok', msg: "you kicked yourself out"});
    }
    
})

//Check Login. Testing only
router.get('/check', (req,res) => {
    if (permission.isLoggedIn(req)) {
        res.json({msg: 'Logged in!', email: req.session.email, fullname: req.session.fullName})
    } else {
        res.json({msg: 'eh.. you kinda did something wrong'})
    }
})

//Change password (NOT RESET PASSWORD).
router.post('/changepassword', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.currentPass && req.body.newPass) {
            async.waterfall([
                function (findAccount) {
                    Account.findById(req.session.accountId, (err,acc) => {
                        if (!err) {
                            findAccount(null, acc.password, acc.key);
                        } else findAccount(err);
                    })
                },
                function (password, key, checkPasswordMatch) {
                    const encryptedInputPass = crypto.createHmac('sha256',key).update(req.body.currentPass).digest('hex');
                    if (encryptedInputPass == password) checkPasswordMatch(null);
                    else checkPasswordMatch('Incorrect Password');
                }, 
                function (updatePassword) {
                    const key = crypto.randomBytes(16).toString('hex');
                    const encryptedNewPassword = crypto.createHmac('sha256', key).update(req.body.newPass).digest('hex');
                    Account.findByIdAndUpdate(req.session.accountId, {password: encryptedNewPassword, key: key}, (err) => {
                        if (!err) updatePassword(null);
                        else updatePassword(err);
                    })
                }
                
            ], (err) => {
                if (!err) res.json({status: 'ok', msg: 'Password changed'})
                else res.json({status: 'error', msg: err})
            })
        } else {
            res.json({status: 'error', msg: 'Please enter a valid form'});
        }
    } else {
        res.json({status: 'error', msg: 'You must be logged in'})
    }
})
// Change Password Algorithm
// 1. Enter old password -> Check if hashed input password == hashed old password.
// 2. Enter new password.
// 3. Create new key, Encrypt the new password using that key.
// 4. Update old password and key with the new password and key.

//Delete an Account
router.get('/delete', (req,res) => {
    /*
        - Delete all tasks, members, member's task, and group's member record associated with the account.
        - Delete Account
    */
    if (permission.isLoggedIn(req)) {
        let memberIDs = [];
        async.waterfall([
            function (deleteAccountTasks) { //Delete personal tasks associated with the account.
                Task.deleteMany({doId: req.session.accountId}, (err) => {
                    if (!err) deleteAccountTasks(null);
                    else deleteAccountTasks(err);
                });
            },
            function (pushMemberIDs) { //List all the account's member IDs to be the filter of the next query.
                Member.find({account: req.session.accountId}, (err,members) => {
                    if (!err) {
                        if (members) {
                            members.forEach((member) => {
                                memberIDs.push(member._id);
                            })
                            pushMemberIDs(null);
                        } else {
                            pushMemberIDs('Sorry, there\'s something wrong with our server, please try again later :(');
                        }
                    } else {
                        pushMemberIDs(err);
                    }
                })
            },
            function (pullTeamMember) { //Update/pull all the Members from all the Teams which contains the member ID that we want to delete.
                Team.updateMany({members: {$in: memberIDs}}, {$pull: {members: {$in: memberIDs}}}, (err) => {
                    if (!err) pullTeamMember(null);
                    else pullTeamMember('Oops..');
                })
            },
            function (deleteMembers) { //Delete Members belonging to the Account that we're deleting
                Member.deleteMany({account: req.session.accountId}, (err) => {
                    if (!err) deleteMembers(null);
                    else deleteMembers(err);
                });
            },
            function (deleteAccount) { //Delete the Account.
                Account.deleteOne({_id: req.session.accountId}, (err) => {
                    if (!err) deleteAccount(null);
                    else deleteAccount(err);
                });
            },
        ], (err) => {
            if (!err) {
                req.session.destroy();
                res.json({status: 'ok', msg: 'Account successfully deleted. I, Marco Fernandio, sincerely thank you from the bottom of my heart! <3'});
            }
            else res.json({status: 'error', msg: err});
        })
    } else {
        res.json({status: 'error', msg: 'Not logged in'});
    }
})

//Update bio
router.post('/updatebio', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.bio && req.body.bio.length) {
            Account.findByIdAndUpdate(req.session.accountId, {bio: req.body.bio}, (err) => {
                if (!err) res.json({status: 'ok', msg: 'bio updated!'});
                else res.json({status: 'error', msg: 'Please try again later'})
            })
        } else {
            res.json({status: 'error', msg: 'Invalid form'})
        }
    } else {
        res.json({status: 'error', msg: 'Not logged in'});
    }
})


module.exports = router