var mongoose = require('mongoose');
var Schema = mongoose.Schema

var accountSchema = new Schema({
    fullName: {
        type: String, 
        required: true
    }, 
    password: {
        type: String, 
        required: true
    }, 
    email: {
        type: String, 
        required: true
    }, 
    bio: String,
    member: [{
        type: Schema.Types.ObjectId,
        team: String, 
        position: String,
    }],
    personalTasks: [{
        type: Schema.Types.ObjectId, 
        title: String
    }]
    
})

var Account = mongoose.model('account', accountSchema)
module.exports = Account;