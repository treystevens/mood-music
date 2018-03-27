const genres = [ "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep","power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music" ];

const access_token = getParameterByName("access_token");
const moodForm = document.querySelector('.mood__form');
const userMood = document.querySelector('.mood__val');
const clearGenres = document.querySelector('.genres-filters__clear');
const createPlaylistSubmit = document.querySelector('.cr-pl__submit');
const importPlaylistSubmit = document.querySelector('.im-pl__submit');
let genreItems = Array.from(document.getElementsByClassName('genres-list__item'));
const genreDrop = document.querySelector('.genres-drop__header');
let addPlaylist = Array.from(document.getElementsByClassName('cr-pl__btn'));
let currentTracks = [];
const userInfo = {};
let totalPlaylists = [];
let modal = document.querySelector('.modal');
let songQueue = [];
const playlistBar = document.querySelector('.playlist-bar');
const playlistList = document.querySelector('.playlist-list');
const playlistExtended = document.querySelector('.playlist-extended');
var currentChosenPlaylist = {};
let playlistNameTab = Array.from(document.getElementsByClassName('playlist-list__name'));





addPlaylist.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        modal.style.display = "block";
    });
});

// When the user clicks on <span> (x), close the modal
// span.onclick = function() {
//     modal.style.display = "none";
// }

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
};

// Expand playlist footer
playlistBar.addEventListener('click', () => {
    const playlist = document.querySelector('.playlist');
    const addBtn = document.querySelector('.playlist-add');
    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
    // const playlistExtended = document.querySelector('.playlist-extended');

    if(playlist.style.height == '100%'){
        playlist.style.height = '30px';
        addBtn.style.display = 'inline-block';
        playlistExtended.style.display = 'none';
    }
    else {
        // playlistBar.style.width = '100%';
        playlist.style.height = '100%';
        addBtn.textContent = 'Create New Playlist +';
        playlistExtended.style.display = 'flex';
    }

});


// Genre restriction
genreItems.forEach( (genre) =>{
    genre.addEventListener('click', (evt) =>{
        
        let classLength = document.querySelectorAll('.genres-toggle').length;

        if(classLength > 4) {
            console.log(`Can't add another genre, sorry`);
            evt.target.classList.remove("genres-toggle");
        }
        else{
            evt.target.classList.toggle("genres-toggle");
            console.log(classLength);
        }
    });
});

// Drop Genre dropdown
genreDrop.addEventListener('click', () => {
    // console.log('CLICKZOORRR');
    document.querySelector('.genres-filter__toggle').classList.toggle('genres-show');
});

// Close dropdown by clicking on window
// window.addEventListener('click', () =>{

//     let genreTog = document.querySelector('.genres-show');
//     genreTog.classList.remove('.genres-show');
// })

// Remove Genres clicked from user
clearGenres.addEventListener('click', () => {
    let classLength = Array.from(document.querySelectorAll('.genres-toggle'));
    classLength.forEach( (genre) => {
        genre.classList.remove('genres-toggle');
    });
    // console.log(classLength);
});

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

// Fetch to Spotify API... 
function spotifyProcessTracks(url){
    spotifyGrab(url)
    .then( (response) => {
        response.json()
        .then( (data) => {
            // DON'T FORGET TO ERROR CHECK. NEED TO! ITERATE OVER THE DATA KEYS TO SEE WHICH IS UNDEFINED FOR OF OR FOR IN...FORGOT
            // console.log(data.tracks, `this is the data.tracks`);
    
            data.tracks.forEach((track) => {
                // Check if song is already in the DOM
                if(currentTracks.length > 0){
                    for(let i = 0; i < currentTracks.length; i++){
                        if(track.album.name === currentTracks[i].album_name) return;
                    }
                }

            if(track.preview_url && track.album.images[1] && track.uri) {
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
        }).catch((err) => {
            console.log(err);
        });
    });
}

// Create DOM structure from Fetched songs
function createSongBody(trackObj){
    
    const div = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('a');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    const playlistAddBtn = document.createElement('button');
    const getDiv = document.querySelector('.tracks');

    // Setting up classes
    trackLink.classList.add('track__link');
    div.classList.add('track');
    img.classList.add('track__img');
    headings.h1.classList.add('track__name');
    headings.h2.classList.add('track__arist');
    headings.h4.classList.add('track__album');
    playlistAddBtn.classList.add('track__pl-add', 'cr-pl__btn');

    // Setting DOM display
    trackLink.setAttribute('href', trackObj.preview_url);

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
    div.appendChild(playlistAddBtn);

    // Preview Songs
    let audioTrack = new Audio(trackLink.href);    
    trackLink.addEventListener('click', (evt) => {
        evt.preventDefault();
        
        audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
    });
       
    // Add tracks to playlist
    playlistAddBtn.addEventListener('click', (evt) => {
        let addedSong = [getSongURI(evt.target)];

        if(totalPlaylists.length === 0){
            let queuedSong = getSongURI(evt.target);
            
            songQueue.push(queuedSong);
            

            // Pop out Playlist create modal
            modal.style.display = "block";

        }
        else if(totalPlaylists.length === 1){
            currentChosenPlaylist.name = totalPlaylists[0].name;
            currentChosenPlaylist.id = totalPlaylists[0].id;
            

            addSongToPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, addedSong, currentChosenPlaylist.id);    
        }
        else{
           

            addSongToPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, addedSong, currentChosenPlaylist.id); 
        }       
    });   
}

function updateTotalPlaylistCount(name, id){
    const playlistAmount = document.querySelector('.playlist-amount');

    let playlist = {
        name: name,
        id: id
    };
    
    totalPlaylists.push(playlist);
    playlistAmount.textContent = totalPlaylists.length;
}

function spotifyCreatePlaylist(url){

    let data = {
        description: '' || document.querySelector('.cr-pl__description').value,
        public: true,
        name: document.querySelector('.cr-pl__name').value || document.querySelector('.im-pl__name').value 
      };

    const init = {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json' ,
            'Authorization': 'Bearer ' + access_token
        },
        body: JSON.stringify(data)
    };

    let spotifyData = fetch(url, init)
    .then( (data) => {
        return data.json();
    })
    .then( (createdPlaylist) => {

        updateTotalPlaylistCount(createdPlaylist.name, createdPlaylist.id);
        

        playlistPlate(createdPlaylist.name);

        if(songQueue.length > 0){
               
            
            // If there are songs in the queue add them to the newly created playlist
            addSongToPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${playlist.id}/tracks`, songQueue, playlist.id);
            
            }
                
        // console.log(totalPlaylists, `total playlist`);
    })
    .catch((err) => {
        console.log(err);
    });

    // return spotifyData;
}

function playlistPlate(name){
    const playlistDiv = document.createElement('div');
    const trackWrapper = document.createElement('div');
    playlistDiv.textContent = name;

    playlistDiv.classList.add('playlist-list__name');
    trackWrapper.classList.add('track-wrapper');

    playlistDiv.addEventListener('click', (evt) => {
        let playlistName = evt.target.childNodes[0].textContent;
        let playlistID;
        currentChosenPlaylist.name = playlistName;
        

        console.dir(evt.target, `the event target`);
        for(let k in totalPlaylists){
            
            if(playlistName === totalPlaylists[k].name) {
                // currentChosenPlaylist.name = totalPlaylists[k].name;
                currentChosenPlaylist.id = totalPlaylists[k].id;
                
                
            }
        }

        // Set up drop down to hide playlist
        

    });

    playlistList.appendChild(playlistDiv);
    playlistDiv.appendChild(trackWrapper);
}

function addSongToPlaylist(url, songLinks, playlistID){

    let data = {
        uris: songLinks
    };
    const init = {
        method: 'POST',
        headers:{
            'Content-Type': 'application/json' ,
            'Authorization': 'Bearer ' + access_token
        },
        body: JSON.stringify(data)
    };

    // Add song to playlist
    fetch(url, init)
    .then( (response) => {
        while(songQueue.length > 0){
            songQueue.pop();
        }
        return response.json();
    })
    .then((data) => {
        // Get back updated playlist
        spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${playlistID}/tracks`)
        .then((playlist) => {
            return playlist.json();
        })
        
        .then( (updatedPlaylist) => {
            let playlistNameTab = Array.from(document.querySelectorAll('.playlist-list__name'));
            let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
            let counter = 0;
            let updateThisPlaylist;
            let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
            
            console.dir(trackWrapper);

            // playlistNameTab.forEach((listItem) => {

            //     if(listItem.childNodes[0].textContent === currentChosenPlaylist.name){
            //         updateThisPlaylist = listItem;
                    
            //     }
            // });


            trackWrapper.forEach( (wrapper) => {
                if(wrapper.parentElement.childNodes[0].textContent === currentChosenPlaylist.name){
                    updateThisPlaylist = wrapper;
                    // console.log(playlist, `this is the list item`);
                }
            });

            // This is for dealing with the DOM's live list
            for (let i = updateThisPlaylist.children.length; i--; ) {
                updateThisPlaylist.children[i].remove();
             }

            updatedPlaylist.items.forEach( (playlistSong) => {

                createPlaylistBody(playlistSong);
            });

            
        });
        
    })
    .catch((err) => {
        console.log(err);
    });


}

// Need to see what can be refactored from this and createSongBody function
function createPlaylistBody(playlistObj, importedPlaylistName){
    const div = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('a');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    const playBtn = document.createElement('button');
    let userChosenPlaylist;
    let playlistNameBar = document.querySelectorAll('.playlist-list__name');
    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));

    let newPlaylist = {
        album_name: playlistObj.track.album.name,
        album_img: playlistObj.track.album.images[1],
        artist: playlistObj.track.artists[0].name,
        preview_url: playlistObj.track.preview_url,
        song_title: playlistObj.track.name,
        trackID: playlistObj.track.id,
        uri: playlistObj.track.uri
    };
    
    

    // Append playlist songs to the playlist the user clicked
        playlistNameBar.forEach((listItem) => {
            if(listItem.childNodes[0].textContent === currentChosenPlaylist.name){
                userChosenPlaylist = listItem.firstElementChild;
            }
            else if(importedPlaylistName){
                if(listItem.childNodes[0].textContent === importedPlaylistName){
                    userChosenPlaylist = listItem.firstElementChild;
                }
            }
        });
 
    
    console.dir(userChosenPlaylist);


    // Setting up classes
    trackLink.classList.add('playlist-track__link');
    div.classList.add('playlist-track'); // 'playlist-track',
    img.classList.add('playlist-track__img');
    headings.h1.classList.add('playlist-track__name');
    headings.h2.classList.add('playlist-track__arist');
    headings.h4.classList.add('playlist-track__album');
    playBtn.classList.add('playlist-track__play');

    // Setting DOM display
    trackLink.setAttribute('href', newPlaylist.preview_url);

    img.src = newPlaylist.album_img.url;
    headings.h1.textContent = newPlaylist.song_title;
    headings.h2.textContent = newPlaylist.artist;
    headings.h4.textContent = newPlaylist.album_name;


    // Attach to DOM 
    userChosenPlaylist.appendChild(div);
    div.appendChild(trackLink);
    trackLink.appendChild(img);
    div.appendChild(headings.h1);
    div.appendChild(headings.h4);
    div.appendChild(headings.h2);
    // div.appendChild(playlistAddBtn);

    // Preview Songs
    let audioTrack = new Audio(trackLink.href);    
    trackLink.addEventListener('click', (evt) => {
        evt.preventDefault();
        
        audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
    });
}

function getSongURI(event){
    songReference = event.parentElement.getElementsByTagName('a')[0].href;
    let addedSong;
    for(let k in currentTracks){
        if(currentTracks[k].preview_url === songReference) addedSong = currentTracks[k].uri;
    }
    return addedSong;
}

// Play songs fetched from Spotify
function playSound(url) {
    var a = new Audio(url);
    a.play();
}

// Generate random genres in the URL if no genre(s) specified
function getGenres(url) {
    let buildGenres;
    let classLength = Array.from(document.querySelectorAll('.genres-toggle'));

    // Use user chosen genres
    if(classLength.length > 0){
        classLength.forEach( (genre) => {
            if(buildGenres === undefined) {
                buildGenres = `&seed_genres=${genre.textContent.toLowerCase().replace(/ /g,"-")}`;
            }
            else {
                buildGenres += `,${(genre.textContent.toLowerCase().replace(/ /g,"-"))}`;
            }
        });
    }
    else {
        // Randomize genres if user decides no genres
        for(let i = 0; i < 5; i++){
            let randomNumber = Math.floor(Math.random() * Math.floor(genres.length));

            if(buildGenres === undefined) buildGenres = `&seed_genres=${genres[randomNumber]}`;
            else {
                buildGenres += `,${genres[randomNumber]}`;
            }
        }
    }
    url += buildGenres;
    return url;
}

// Get username.  *** Implement Error check if guest account ***
spotifyGrab("https://api.spotify.com/v1/me")
.then( (data) => {
    data.json()

    .then( (jsonData) => {
        let username = document.getElementById('username');
        jsonData.display_name ? username.textContent = jsonData.display_name : username.textContent = jsonData.id; // jshint ignore:line


        // Copy Spotify User Info
        for(let i in jsonData){
            userInfo[i] = jsonData[i];
        }

         // Put user info into form input
        // playlistSubmit.setAttribute(`action`, `https://api.spotify.com/v1/users/${userInfo.id}/playlists`)
        
        // console.log(jsonData);
    });
})
.catch((err) => {
    console.log(err);
});

// Show music
moodForm.addEventListener('submit', (evt) => {
    evt.preventDefault();
    let trackContainer = document.querySelector('.track-container');
    let tracksDiv = document.querySelector('.tracks');
    let userMoodValue = userMood.value.toLowerCase();
    const showPlaylist = document.querySelector('.playlist');
    
    // showPlaylist.classList.remove('hide-playlist');
    playlistExtended.style.display = 'none';
    showPlaylist.style.display = 'flex';
    // showPlaylist.style.flexdirection = 'column'
    userMood.value = '';


    // Show the playlist footer, so initially hide it
    
    // Delete previous entries inside track div
    while (tracksDiv.firstChild) {
        tracksDiv.removeChild(tracksDiv.firstChild);
    }
    
    // Fetch emotion json from my database
    fetch(`/${userMoodValue}`)
    .then( (data) => {
        return data.json();
    })
    .then( (audioFeatures) => {
        const maxVal = Math.max(...audioFeatures[0].idNumbers);
        const minVal = Math.min(...audioFeatures[0].idNumbers);
        let url = `https://api.spotify.com/v1/recommendations?max_valence=${maxVal}&min_valence=${minVal}&limit=30`;

        // Match genres with energy levels specified with energy levels of songs
        if(audioFeatures[0].hasOwnProperty('minEnergy')){
            url += `&min_energy=${audioFeatures[0].minEnergy}`;
        }
        if(audioFeatures[0].hasOwnProperty('maxEnergy')){
            url += `&max_energy=${audioFeatures[0].maxEnergy}`;
        }

        let newUrl = getGenres(url); 
        spotifyProcessTracks(newUrl);   
    
        // Infinite Scroll
        document.addEventListener('scroll', function() {
            let scrollPosition = window.pageYOffset;
            let windowSize = window.innerHeight;
            let bodyHeight = document.body.offsetHeight;
            
            if(scrollPosition + windowSize >= bodyHeight){
                let scrollUrl = getGenres(url);
                spotifyProcessTracks(scrollUrl); 
            }
          });

          
        // Creating a new playlist 
        createPlaylistSubmit.addEventListener('submit', (evt) => {

            evt.preventDefault();
            spotifyCreatePlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists`);
        });

        // Importing a new playlist
        importPlaylistSubmit.addEventListener('submit', (evt) => {

            let importPlaylistName = document.querySelector('.im-pl__name').value;
            let flexibleName = importPlaylistName.toLowerCase();
            let importedPlaylistID;

            evt.preventDefault();
            

            spotifyGrab(`https://api.spotify.com/v1/me/playlists`)
            .then((data) => {
                return data.json();
            })
            .then( (listOfUserPlaylists) => {
                let playlist;

                // Cycle through to get user requested playlist ID 
                listOfUserPlaylists.items.forEach( (playlist) => {
                    if(flexibleName == playlist.name.toLowerCase()){
                        importedPlaylistID = playlist.id;
                    }
                });

                updateTotalPlaylistCount(importPlaylistName, importedPlaylistID);
                playlistPlate(importPlaylistName);


                // Fetch for that specfic ID
                // Fetch that URL get the returned tracks and put into creat Playlist tracks
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${importedPlaylistID}/tracks`)
                .then((response) => {
                    return response.json();
                })
                .then((importedTracks) => {
                    console.log(importedTracks);
                    importedTracks.items.forEach( (playlistSong) => {

                        createPlaylistBody(playlistSong, importPlaylistName);
                    });

                });

                console.log(listOfUserPlaylists);


            })
            .catch((err) => {
                console.log(err);
            });
           
        });
    })
    .catch( (err) => {
        console.log(err);
    });

});






