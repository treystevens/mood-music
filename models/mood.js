const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const MoodSchema = new Schema ({
    mood: String,
    synonyms: [String],
    idNumbers: [Number],
    minEnergy: Number,
    maxEnergy: Number
});

const Mood = mongoose.model('mood', MoodSchema);

module.exports = Mood;