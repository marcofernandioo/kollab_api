var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamPermissionSchema = new Schema({
    team: Schema.Types.ObjectId,
    teamName: String,
    minAssignTask: Number, 
    maxAssignTask: Number, 
    minPromote: Number, 
    maxPromote: Number,
    minAddMember: Number, 
    maxAddMember: Number, 
    minViewTask: Number, 
    maxViewTask: Number,
    minAddTask: Number, 
    maxAddTask: Number, 
    minCreateGroup: Number, 
    maxCreateGroup: Number,
})

var Permission = mongoose.model('teamPermission', teamPermissionSchema);
module.exports = Permission;