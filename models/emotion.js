const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EmotionSchema = new Schema ({
    mood: String,
    synonyms: [String],
    idNumbers: [Number]
});

const TestEmotion = mongoose.model('testemotion', EmotionSchema);

module.exports = TestEmotion;
