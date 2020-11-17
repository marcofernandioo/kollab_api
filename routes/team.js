var express = require('express');
var permission = require('../systems/permission');
var router = express.Router();

//Create team
router.post('/create', (req,res) => {
    if (permission.isLoggedIn(req)) {

    } else {
        res.json({status: 'error', msg: 'Not Logged In!'})
    }
})

module.exports = router;