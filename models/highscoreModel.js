var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var highscoreSchema = new Schema({
    score : String,
    user  : {
        type : Schema.ObjectId,
        ref  : 'user'
    }
});

mongoose.model('highscore', highscoreSchema);
