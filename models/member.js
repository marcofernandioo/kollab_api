var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId, 
        required: true 
    },
    accountName: String,
    // group: {
    //     type: Schema.Types.ObjectId, 
    //     required: true
    // }, 
    // groupName: String,
    position: {
        type: String, 
        required: true
    }, 
    tasks: [{
        type: Schema.Types.ObjectId,
        title: String,
    }]

})

var Member = mongoose.model('member', memberSchema);
module.exports = Member;