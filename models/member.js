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
    tasks: [{
        task: Schema.Types.ObjectId,
        title: String,
        description: String,
        deadline: String,
        notes: String
    }]

})

var Member = mongoose.model('member', memberSchema);
module.exports = Member;