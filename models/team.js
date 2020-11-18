var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = new Schema ({
    teamName: {
        type: String, 
        required: true
    },
    teamDescription: String,
    teamOwner: String,
    groups:  [{
        type: Schema.Types.ObjectId,
        groupName: String,
    }],
    members: [{
        fullName: String
    }]
})

var Team = mongoose.model('team', teamSchema);
module.exports = Team;