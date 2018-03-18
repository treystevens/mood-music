const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Emotion = require('./models/emotion');
let app = express();

mongoose.connect('mongodb://localhost/testmood');
mongoose.Promise = global.Promise;

mongoose.connection.once('open', (mssg) =>{
    console.log(`connection has been made, now make fireworks`)});

app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: true}));

// app.get('/', (req, res) => {
//     // console.log(req, `This is for PARAMS GET listener in 3000`);
//     // console.log(req.body, 'this is the body');
//     res.end();
// });

app.get('/:emotion', (req,res) => {
    console.log(req.params, `this is req params`);
    let word = req.params.emotion;
    // console.log(req.params.emotion);
    console.log(word, `is word coming through?`);

    Emotion.find({synonyms: word})
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