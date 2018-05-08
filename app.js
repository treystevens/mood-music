const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Emotion = require('./models/emotion');
const Mood = require('./models/mood.js');
let app = express();

mongoose.Promise = global.Promise;

// mongoose.connect('mongodb://localhost/testmood');
mongoose.connect('mongodb://localhost/moodmusic')



mongoose.connection.once('open', (mssg) =>{
    console.log(`connection has been made, now make fireworks`);
});

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

// app.get('/', (req, res) => {
//     
//    
//     res.end();
// });

app.get('/:mood', (req,res) => {
    
    let word = req.params.mood;
    

    Mood.find({synonyms: word})
    .then((results) => {
        console.log(results, `these are the results`);
        res.send(results);
    })
    .catch((err) => {
        console.log(err);
    });
});

app.listen(3000, () => {
    console.log(`listening on port 3000`);
});