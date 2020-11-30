var express = require('express');
const Team = require('../models/team');
const Permission = require('../models/permission');
var permission = require('../systems/permission');
var router = express.Router();

//Create a Team
router.post('/create', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.name) {
            var new_team = new Team({
                teamName: req.body.name, 
                teamDescription: req.body.description, 
                teamOwner: req.session.fullName,
                teamOwnerId: req.session.accountId,
                members: [], 
                groups: []
            });
            new_team.save((err) => {
                if (!err) res.json({status: 'ok', msg: 'Team Successfully Created'});
                else res.json({status: 'error', msg: err});
            })
        }
    } else {
        res.json({status: 'error', msg: 'Not Logged In!'})
    }
})

//Edit team information [Havent implemented canEdit permission]
router.patch('/edit', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.teamId) {
            let newTeam = {};
            if (req.body.teamName) newTeam.teamName = req.body.teamName;
            if (req.body.teamDescription) newTeam.teamDescription = req.body.teamDescription;
            
            Team.findOneAndUpdate({_id: req.body.teamId}, newTeam, (err) => {
                if (!err) {
                    res.json({status: 'ok', msg: 'Team updated'});
                } else {
                    res.json({status: 'ok', msg: 'Team updated'});
                }
            })
        } else {
            res.json({status: 'error', msg: 'Invalid form'})
        }
    } else {
        res.json({status: 'ok', msg: 'Not logged in!'});
    }
});

//Set team permission
router.post('/setpermission', (req,res) => {
    if (permission.isLoggedIn(req)) {
        //Only set permission for eligible users
        //
    } else {
        res.json({status: 'ok', msg: 'Not logged in!'});
    }
})

module.exports = router;