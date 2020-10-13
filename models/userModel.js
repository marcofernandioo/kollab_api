var mongoose = require('mongoose');
var Schema = mongoose.Schema

var userSchema = new Schema({
    fullName: {
        type: String, 
        required: true
    }, 
    position: String, 
    
})

var User = mongoose.model('user', userSchema)
module.exports = User;