var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var memberSchema = new Schema({
    account: {
        type: Schema.Types.ObjectId, 
        required: true 
    },
    position: {
        type: String, 
        required: true
    }, 
    tasks: Schema.Types.ObjectId,

})

var Member = mongoose.model('member', memberSchema);
module.exports = Member;