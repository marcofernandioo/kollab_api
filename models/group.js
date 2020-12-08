var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var groupSchema = new Schema({
    teamId: Schema.Types.ObjectId, 
    teamName: String,
    groupName: {
        type: String, 
        required: true
    },
    groupOwner: String,
    groupOwnerId: Schema.Types.ObjectId, 
    members: [{
        type: Schema.Types.ObjectId, 
        fullName: String,
        position: String
    }],
    taskLimit: Number
})

var Group = mongoose.model('group', groupSchema);
module.exports = Group;