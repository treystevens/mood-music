# Mood Music




![Mood Music Logo](/public/assets/logo.png)

<p align="center">Matching your mood to music</p>

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Installation & Usage](#installation--usage)
  - [Requirements](#requirements)
  - [Getting Started](#getting-started)
  - [Register the Application with Spotify](#register-the-application-with-spotify)
  - [Client ID & Client Secret](#client-id--client-secret)
- [Credits](#credit)


# Introduction
Mood Music is built on the Spotify API. Mood Music brings a user-friendly way of matching your mood to Spotify songs.
You'll be able to find music that matches your mood, create and import Spotify playlists, and add the songs from your mood search to those playlists.


# Features
A few things that you can do on Mood Music:

- Add genres to filter your music search
- Create, import, and delete Spotify playlists
- Add songs to and delete songs from your playlists
- Move a song from one playlist to another
- Listen to a 30 second preview of a song


# Installation & Usage

## Requirements
Mood Music requires: 
1. [Node.js](https://nodejs.org/en/)
3. [Spotify account](https://www.spotify.com/) 

## Getting Started

Clone or download the repository:
```
git clone https://github.com/treykris/mood-music.git
```
In the application directory run:
```
npm install 
```

## Register the Application with Spotify
Since Mood Music seeks access to a user’s personal data (profile, playlists, etc.) it must be registered. Log into the [Spotify developer dashboard](https://developer.spotify.com/dashboard/applications) and register the application. The client ID and client secret is what will be used to authenticate our application's requests to Spotify. 

By default Mood Music uses port 5000. Copy the snippet below and add it as a Spotify Redirect URI. 
```
http://localhost:5000/user/callback/
```

Make sure to save your new Spotify settings.

**Important!** If you decide to run Mood Music on a different port have your redirect URI in your Spotify settings match the port you are running the application on.

## Client ID & Client Secret

It's recommended that you create a .env file to store your Spotify client ID and client secret. You want to keep your client secret... a secret.
You have the option of creating a .env file or using the Spotify client ID and client secret directly in server.js

#### Option 1: Creating a .env File (Recommended)
```
// .env file

SPOTIFY_CLIENT_ID=(YOUR CLIENT ID)
SPOTIFY_CLIENT_SECRET=(YOUR CLIENT SECRET)
```

#### Option 2: Using your client ID and secret directly in server.js (Not recommended. Only for personal use)



### You're all set to run the application!





# Credits
The template that helped me get Mood Music off the ground [OAuth Bridge Template](https://github.com/mpj/oauth-bridge-template)
