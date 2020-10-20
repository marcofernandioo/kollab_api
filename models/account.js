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
    member: [
        {
            member: Schema.Types.ObjectId
        }
    ]
    
})

var Account = mongoose.model('account', accountSchema)
module.exports = Account;