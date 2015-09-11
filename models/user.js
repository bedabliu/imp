var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var userSchema = new Schema({
    facebookId : {
        type: String,
        unique: true,
        dropDups: true
    }
});

mongoose.model('user', userSchema);
