let username = document.getElementById('username');
const genres = [ "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep", "power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music" ];



// Get access_token from URI
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
const access_token = getParameterByName("access_token");


// Fetch to Spotify API... 
function spotifyGrab(url){
    const init = {
        headers:{
            'Content-Type': 'application/json' ,
            'Authorization': 'Bearer ' + access_token
        }
    };

    let spotifyData = fetch(url, init);
    return spotifyData;
}

// Get username and image. Error check if guest 
spotifyGrab("https://api.spotify.com/v1/me").then( (data) => {
    data.json()

    .then( (jsonData) => {
       
        jsonData.display_name ? username.textContent = jsonData.display_name : username.textContent = jsonData.id; // jshint ignore:line
        console.log(jsonData);
    });
})
.catch((err) => {
    console.log(err);
});

//Grab Genre's (Filter these out on user input)
// spotifyGrab('https://api.spotify.com/v1/recommendations/available-genre-seeds')


function playSound(url) {
    var a = new Audio(url);
    a.play();
}

function createSongBody(trackObj){
    // console.log(trackObj, `this is the trackobj`);
    const div = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('a');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    const getDiv = document.querySelector('.tracks');

    // Setting up classes
    trackLink.classList.add('track-link');
    div.classList.add('flex-love');
    img.classList.add('img-contain');
    headings.h1.classList.add('song-description');
    headings.h2.classList.add('song-description');
    headings.h4.classList.add('song-description');

    // Setting DOM display
    trackLink.setAttribute('href', trackObj.preview_url);
    // trackLink.preventDefault();
    img.src = trackObj.album_img.url;
    headings.h1.textContent = trackObj.song_title;
    headings.h2.textContent = trackObj.artist;
    headings.h4.textContent = trackObj.album_name;


    // Attach to DOM 
    getDiv.appendChild(div);
    div.appendChild(trackLink);
    trackLink.appendChild(img);
    div.appendChild(headings.h1);
    div.appendChild(headings.h4);
    div.appendChild(headings.h2);
}

function getRandomGenres() {
    let buildGenres;

    for(let i = 0; i < 5; i++){
        let randomNumber = Math.floor(Math.random() * Math.floor(genres.length));
        if(buildGenres === undefined) buildGenres = genres[randomNumber];
        else{
            buildGenres += `,${genres[randomNumber]}`;
        }
    }
    return buildGenres;
}


// On form submission go to database dawg
const formId = document.getElementById('form-emotion');
const emotionVal = document.getElementById('emotion-value');

formId.addEventListener('submit', (evt) => {
    evt.preventDefault();
    let trackContainer = document.querySelector('.track-container');
    let tracksDiv = document.querySelector('.tracks');
    
    // Delete previous entries inside track div
    while (tracksDiv.firstChild) {
        tracksDiv.removeChild(tracksDiv.firstChild);
    }
    
    let storeEmotionVal = emotionVal.value;
    console.log(storeEmotionVal)
    emotionVal.value = '';
                            // fetch(`/?${access_token}&emotion=${storeVal}`)

    // This data is from our databsae
    fetch(`/${storeEmotionVal}`)
    .then( (data) => {
        return data.json();
    })
    .then( (audioFeatures) => {
        let maxVal = Math.max(...audioFeatures[0].idNumbers);
        let minVal = Math.min(...audioFeatures[0].idNumbers);
        let url = `https://api.spotify.com/v1/recommendations?'`;
        
        // Match song energy levels with mood
        if(audioFeatures[0].hasOwnProperty('minEnergy')){
            url += `min_energy=${audioFeatures[0].minEnergy}`;
        }
        if(audioFeatures[0].hasOwnProperty('maxEnergy')){
            url += `max_energy=${audioFeatures[0].maxEnergy}`;
        }

        // If user doesn't use genre filter
        let randomGenres = getRandomGenres(); 

        console.log(`{url}&seed_genres=${randomGenres}&max_valence=${maxVal}&min_valence=${minVal}&limit=100`);

        spotifyGrab(`${url}&seed_genres=${randomGenres}&max_valence=${maxVal}&min_valence=${minVal}&limit=100`)
        .then( (response) => {
            response.json()
            .then( (data) => {
                // DON'T FORGET TO ERROR CHECK. NEED TO! ITERATE OVER THE DATA KEYS TO SEE WHICH IS UNDEFINED FOR OF OR FOR IN...FORGOT
                console.log(data.tracks, `this is the data.tracks`);
        
                data.tracks.forEach((track) => {

                    if(track.preview_url) {
                        let newTrack = {
                            album_name: track.album.name,
                            album_img: track.album.images[1],
                            artist: track.artists[0].name,
                            preview_url: track.preview_url,
                            song_title: track.name,
                            trackID: track.id,
                            uri: track.uri
                        };
                
                        createSongBody(newTrack);
                        currentTracks.push(newTrack);
                    }
                });
            })
            .then( (resolve) => {
                const totalTrackLinks = Array.from(document.getElementsByClassName('track-link'));

                console.log(totalTrackLinks, `total tracks`);

                totalTrackLinks.forEach((track)=> {
                    let audioTrack = new Audio(track.href);
                    track.addEventListener('click', (evt) => {
                        // console.log(evt,'this the event dawg'
                        evt.preventDefault();

                        audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
                    });
                });
            })
        });
    })
    .catch((err) => {
        console.log(err);
    });
});

// https://api.spotify.com/v1/recommendations?seed_genres=hip-hop,r-n-b&max_valence=1&min_valence=.88"

let currentTracks = [];


 // Make music play

// setTimeout(function (){
//     const totalTrackLinks = Array.from(document.getElementsByClassName('track-link'));

//     console.log(totalTrackLinks, `total tracks`);
//     totalTrackLinks.forEach((track)=> {
//         let audioTrack = new Audio(track.href);
//         track.addEventListener('click', (evt) => {
//             // console.log(evt,'this the event dawg'
//             evt.preventDefault();

//             audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
//         });
//     });
// }, 10000);


