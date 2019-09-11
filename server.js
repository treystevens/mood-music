/* eslint-disable no-undef */
const request = require('request');
const querystring = require('querystring');
const express = require('express');
const bodyParser = require('body-parser');
const Moods = require('./moods');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();

const redirect_uri =
  process.env.REDIRECT_URI || 'http://localhost:5000/user/callback/';

// Show login page when user types in moodmusic.com
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/public/login.html');
});

app.get('/user', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

// User enters a mood
app.get('/user/mood/:mood', (req, res) => {
  const word = req.params.mood;
  const mood = Moods.filter(mood => {
    return findSynonym(mood.synonyms, word);
  });

  if (mood.length === 0) res.sendStatus(404);
  else {
    res.status(200).send(mood);
  }
});

function findSynonym(synonyms, word) {
  let foundSynonym = false;

  for (let i = 0; i < synonyms.length; i++) {
    if (word === synonyms[i]) {
      foundSynonym = true;
      return foundSynonym;
    }
  }

  return foundSynonym;
}

// Authorize account
app.get('/spotifylogin', function(req, res) {
  res.redirect(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: process.env.SPOTIFY_CLIENT_ID,
        scope:
          'user-read-private playlist-modify-public playlist-modify-private',
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
      Authorization:
        'Basic ' +
        new Buffer(
          process.env.SPOTIFY_CLIENT_ID +
            ':' +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString('base64')
    },
    json: true
  };
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token;
    let uri = process.env.FRONTEND_URI || 'http://localhost:5000/user/';
    res.redirect(uri + '?access_token=' + access_token);
  });
});

app.listen(port);
