
const request = require('request');
const querystring = require('querystring');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Mood = require('./models/mood');

const app = express();

const redirect_uri = process.env.REDIRECT_URI || 'http://localhost:3000/callback/';

mongoose.Promise = global.Promise;
mongoose.connect(MONGODB_URI);
// mongoose.connect('mongodb://localhost/moodmusic');
mongoose.connection.once('open', (mssg) =>{
    console.log(MONGODB_URI);
    console.log(`Connected to mongoDB`);
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
   console.log(`got you`);
});


app.get('/spotifylogin', function(req, res) {
  
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: process.env.SPOTIFY_CLIENT_ID,
      scope: 'user-read-private playlist-modify-public playlist-modify-private',
      redirect_uri
    })
  );
});


app.get('/callback', function(req, res) {
  let code = req.query.code || null;
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET
      ).toString('base64'))
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || 'http://localhost:3000';
    res.redirect(uri + '?access_token=' + access_token);
  });
});

app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/public/login.html');
})


app.get('/mood/:mood', (req,res) => {
    
  let word = req.params.mood;
  console.log(word);
  console.log(req.params, `params`);

  Mood.find({synonyms: word})
  .then((results) => {
      console.log(results, `these are the results`);
      res.send(results);
  })
  .catch((err) => {
      console.log(err);
  });
});


let port = process.env.PORT || 3000;
console.log(`Listening on port ${port}. Go /login to initiate authentication flow.`);
app.listen(port);


