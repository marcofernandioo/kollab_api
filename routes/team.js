var express = require('express');
const Team = require('../models/team');
var permission = require('../systems/permission');
var router = express.Router();

//Create team
router.post('/create', (req,res) => {
    if (permission.isLoggedIn(req)) {
        if (req.body && req.body.name) {
            var new_team = new Team({
                teamName: req.body.name, 
                teamDescription: req.body.description, 
                teamOwner: req.session.fullName,
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

module.exports = router;