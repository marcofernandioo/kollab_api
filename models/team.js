var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamSchema = new Schema ({
    teamName: {
        type: String, 
        required: true
    },
    teamDescription: String,
    teamOwner: String,
    teamOwnerId: Schema.Types.ObjectId,
    groups:  [{
        type: Schema.Types.ObjectId,
        groupName: String,
    }],
    members: [{
        type: Schema.Types.ObjectId
    }]
})

var Team = mongoose.model('team', teamSchema);
module.exports = Team;