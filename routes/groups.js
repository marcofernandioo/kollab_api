var express = require('express');
var router = express.Router();

//Create a Group
router.post('/create', (req,res) => {
    //1. Check if logged in.
    //2. Check if inputted Team exists.
    //3. Check if logged in Account is a Member of the Team.
    //4. Check if the Member has the permission to edit the Team. IOW, create a new Group within the Team.
})

//Delete a Group
router.get('/delete', (req,res) => {
    //1. Check if logged in.
    //2. Check if inputted Team exists.
    //3. Check if logged in Account is a Member of the Team.
    //4. Check if the Member has the permission to edit the Group. IOW, create a new Group within the Team.
})

module.exports = router;