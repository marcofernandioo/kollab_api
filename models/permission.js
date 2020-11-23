var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var teamPermissionSchema = new Schema({
    team: Schema.Types.ObjectId,
    teamName: String,
    minAssignTask: Number, 
    minPromote: Number, 
    minAddMember: Number,  
    minViewTask: Number, 
    minAddTask: Number, 
    minCreateGroup: Number
})

var Permission = mongoose.model('teamPermission', teamPermissionSchema);
module.exports = Permission;