const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EmotionSchema = new Schema ({
    emotion: String,
    words: [ String ],
    idNumber: Number
});

const Emotion = mongoose.model('emotion', EmotionSchema);

module.exports = Emotion;
