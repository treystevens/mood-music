const request = require('request');
const querystring = require('querystring');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const Mood = require('./models/mood');
const app = express();
const redirect_uri = process.env.REDIRECT_URI || 'http://localhost:5000/user/callback/';

mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.once('open', (mssg) =>{
    console.log(`Connected to mongoDB`);
});


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});


app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));



app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});


app.get('/user/mood/:mood', (req,res) => {
  
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


app.get('/user/callback', function(req, res) {
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
    let uri = process.env.FRONTEND_URI || 'http://localhost:5000/user/';
    res.redirect(uri + '?access_token=' + access_token);
  });
});




let port = process.env.PORT || 5000;
console.log(`Listening on port ${port}. Go to "/" or "/login" to initiate authentication flow.`);
app.listen(port);


