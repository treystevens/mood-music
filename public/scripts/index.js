const access_token = getParameterByName("access_token");

const createPlaylistSubmit = document.querySelector('.cr-pl__submit');
const importPlaylistSubmit = document.querySelector('.im-pl__submit');


// Counting on being manipulated
let currentTracks = [];
const userInfo = {};
let totalPlaylists = [];
let songQueue = [];
var currentChosenPlaylist = {};
let sortedChosenGenres = [];


let modal = document.querySelector('.modal');
let deleteModal = document.querySelector('.delete-modal');
let moveSongModal = document.querySelector('.mvs-modal');


const playlistExtended = document.querySelector('.playlist-extended');

let deleteThis;
let playlistNameValue;
let optionsHelper;

// let successBtn = document.querySelector('.success-btn');

// Random Color for Playlist
function randomColor(){
    let colors = ['#E8A5A5', '#783E3E', '#BF4949', '#D15273']
    var randomColor = colors[Math.floor(Math.random() * colors.length)];

    return randomColor;
}


// Build URL with genres
function handleGenres(url, storedGenres) {
    const genres = [ "acoustic", "afrobeat", "alt-rock", "alternative", "ambient", "anime", "black-metal", "bluegrass", "blues", "bossanova", "brazil", "breakbeat", "british", "cantopop", "chicago-house", "children", "chill", "classical", "club", "comedy", "country", "dance", "dancehall", "death-metal", "deep-house", "detroit-techno", "disco", "disney", "drum-and-bass", "dub", "dubstep", "edm", "electro", "electronic", "emo", "folk", "forro", "french", "funk", "garage", "german", "gospel", "goth", "grindcore", "groove", "grunge", "guitar", "happy", "hard-rock", "hardcore", "hardstyle", "heavy-metal", "hip-hop", "holidays", "honky-tonk", "house", "idm", "indian", "indie", "indie-pop", "industrial", "iranian", "j-dance", "j-idol", "j-pop", "j-rock", "jazz", "k-pop", "kids", "latin", "latino", "malay", "mandopop", "metal", "metal-misc", "metalcore", "minimal-techno", "movies", "mpb", "new-age", "new-release", "opera", "pagode", "party", "philippines-opm", "piano", "pop", "pop-film", "post-dubstep","power-pop", "progressive-house", "psych-rock", "punk", "punk-rock", "r-n-b", "rainy-day", "reggae", "reggaeton", "road-trip", "rock", "rock-n-roll", "rockabilly", "romance", "sad", "salsa", "samba", "sertanejo", "show-tunes", "singer-songwriter", "ska", "sleep", "songwriter", "soul", "soundtracks", "spanish", "study", "summer", "swedish", "synth-pop", "tango", "techno", "trance", "trip-hop", "turkish", "work-out", "world-music" ];
    let buildGenres;
    let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
    let reg = /&/g;

    // Use user chosen genres
    if(storedGenres.length > 0){
        storedGenres.forEach( (genre) => {
            if(buildGenres === undefined) {
                buildGenres = `&seed_genres=${genre}`; 
            }
            else {
                buildGenres += `,${genre}`; 
            }
        });
    }
    else {
        // Randomize 5 genres if no genres were chosen
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





// Make Song URI into URI format
function processSongURI(uri){
    var reg = /\w+:/g; 
    let trackURI = uri.replace(reg, '');

    return trackURI;
    
}

// GET Request to Spotify API 
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

// DELETE Request to Spotify API 
function deleteSong(url, track){
    
    let data = {
     tracks: [
       {
         uri: track
       }
     ]
   };
 
     const init = {
         method: 'DELETE',
         headers:{
             'Content-Type': 'application/json' ,
             'Authorization': 'Bearer ' + access_token
         },
         body: JSON.stringify(data)
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

// Move a Song to Another Playlist -- *** REFACTOR**
function moveSongFromPlaylist(url, songLinks, playlistID){

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
    let spotifyData = fetch(url, init)
    .then( (response) => {
        return response.json();
    })
    .then((data) => {
        // Get back updated playlist
        spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${playlistID}/tracks`)
        .then((playlist) => {
            
            return playlist.json();
        })
        .then((movedPlaylist) =>{
            
            let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
            let updateThisPlaylist;
            let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
            
            trackWrapper.forEach( (wrapper) => {
                if(wrapper.parentElement.childNodes[0].textContent === playlistNameValue){
                    updateThisPlaylist = wrapper;
                    
                }
            });

            // This is for dealing with the DOM's live list
            for (let i = updateThisPlaylist.children.length; i--; ) {
                updateThisPlaylist.children[i].remove();
            }

            movedPlaylist.items.forEach( (playlistSong) => {

                createPlaylistBody(playlistSong, playlistNameValue);
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
    return spotifyData;
}

// Retrieve Playlist ID from Total Playlists
function getPlaylistID(playlistName){
    let playlistID;
    for(let k in totalPlaylists){
        if(playlistName === totalPlaylists[k].name){
            playlistID = totalPlaylists[k].id;
        } 
    }
    return playlistID;
}

// Remove Playlist from Total Playlist
function removeFromTotalPlaylists(name){
    let playlistID = getPlaylistID(name);
    let index = playlistAlreadyExistCheck(playlistID);
    totalPlaylists.splice(index, 1);
    updatePlaylistCount();
    
}

// Playlist Exists in Total Playlist
function playlistAlreadyExistCheck(playlistID){
    for(let property in totalPlaylists){
        if(totalPlaylists[property].id === playlistID){
            return totalPlaylists.indexOf(totalPlaylists[property]);
        }
    }
}

// Push to Total Playlists // Change index to exists??
function updateTotalPlaylists(name, id){

    if(!id){
        return;
    }
    let exists;
    let playlist = {
        name: name,
        id: id
    };

    let index = playlistAlreadyExistCheck(id);
    
    if(index === undefined){
        totalPlaylists.push(playlist);
        updatePlaylistCount();
        exists = false;
        return exists;
    }
    else{
        exists = true;
        return exists;
    }
}

// Update Playlist Footer Count
function updatePlaylistCount(){
    const playlistAmount = document.querySelector('.playlist-amount');
    playlistAmount.textContent = totalPlaylists.length;
}

// POST Request to Spotify API
function spotifyCreatePlaylist(url){

    let data = {
        description: '' || document.querySelector('.cr-pl__description').value,
        public: true,
        name: document.querySelector('.cr-pl__name').value
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
    

        updateTotalPlaylists(createdPlaylist.name, createdPlaylist.id);
        playlistPlate(createdPlaylist.name, createdPlaylist.id);

        // If there are songs in the queue add them to the newly created playlist
        if(songQueue.length > 0){
            addSongToPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${createdPlaylist.id}/tracks`, songQueue, createdPlaylist.id);
            }       
    })
    .catch((err) => {
        console.log(err);
    });

    // return spotifyData;
}



function getNeededClass(evt, className){

}


// ****************************************************************************************
// Playlist Template ( NEED TO ADD/CHANGE BECAUSE OF ADDED H4 TAG)
function playlistPlate(name, id){
    const playlistList = document.querySelector('.playlist-list');
    const playlistDiv = document.createElement('div');
    const trackWrapper = document.createElement('div');
    const playlistName = document.createElement('h4');
    const removePlaylist = document.createElement('span');
    
    let moreOptionsDropSelection = document.getElementsByClassName('options-dropdown__link');

    playlistDiv.textContent = name;
    playlistName.textContent = name;
    // removePlaylist.textContent = 'x';

    
    playlistDiv.classList.add('playlist-list__name');
    trackWrapper.classList.add('track-wrapper');
    removePlaylist.classList.add('remove-playlist');

    playlistDiv.setAttribute('data-playlist-id', id);
    playlistDiv.style.backgroundColor = randomColor();

    currentChosenPlaylist.name = name;
    currentChosenPlaylist.id = id;


    playlistList.appendChild(playlistDiv);
    playlistDiv.appendChild(trackWrapper);
    playlistDiv.appendChild(removePlaylist); // Unsure may break code
}
// ****************************************************************************************************

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

    // Add song(s) to playlist
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
            
            let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
            let counter = 0;
            let updateThisPlaylist;
            let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
            
            console.dir(trackWrapper);

            trackWrapper.forEach( (wrapper) => {
                if(wrapper.parentElement.childNodes[0].textContent === currentChosenPlaylist.name){
                    updateThisPlaylist = wrapper;
                }
            });


            // This is for dealing with the DOM's live list
            if(updateThisPlaylist.children){
                for (let i = updateThisPlaylist.children.length; i--; ) {
                    
                    updateThisPlaylist.children[i].remove();
                 }
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

// ****************************************************************************************
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
// Need to see what can be refactored from this and createSongBody function
function createPlaylistBody(playlistObj, importedPlaylistName){
    const playlistTrackDiv = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('audio');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    // const playBtn = document.createElement('button'); 
    // Dropdown for playlist
    const moreOptions = document.createElement('div');
    const moreOptionsDropdown = document.createElement('div');
    const playBtn = document.createElement('a');
    // const playBtnContainer = document.createElement('a');
    const headingContainer = document.createElement('div');
    const goToLink = document.createElement('a');
    const moveToAPlaylist = document.createElement('a');
    const deleteTrack = document.createElement('a');
    // const songTrack = document.createElement('audio');

    

    

    let userChosenPlaylist;
    let playlistNameBar = document.querySelectorAll('.playlist-list__name');
    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));

    let newPlaylistTrack = {
        album_name: playlistObj.track.album.name,
        album_img: playlistObj.track.album.images[1],
        artist: playlistObj.track.artists[0].name,
        preview_url: playlistObj.track.preview_url,
        song_title: playlistObj.track.name,
        trackID: playlistObj.track.id,
        uri: playlistObj.track.uri
    };
    
    
    // songTrack.src = newPlaylistTrack.preview_url;
    // songTrack.duration;
    trackLink.src = newPlaylistTrack.preview_url;

    // Append playlist songs to the playlist the user clicked
 

        playlistNameBar.forEach((listItem) => {
            if(importedPlaylistName){
                if(listItem.childNodes[0].textContent === importedPlaylistName){
                    userChosenPlaylist = listItem.firstElementChild;
                }
            }
            else if(listItem.childNodes[0].textContent === currentChosenPlaylist.name){
                userChosenPlaylist = listItem.firstElementChild;
            }
        });

        // If user made requests to add songs without a playlist. This will point to the first playlist
        if(userChosenPlaylist === undefined){
            userChosenPlaylist = playlistNameBar[0].firstElementChild;
        }


    // Setting up classes
    trackLink.classList.add('playlist-track__link');
    playlistTrackDiv.classList.add('playlist-track'); // 'playlist-track',
    img.classList.add('playlist-track__img');
    headingContainer.classList.add('playlist-track__head-container');
    headings.h1.classList.add('playlist-track__name');
    headings.h2.classList.add('playlist-track__arist');
    headings.h4.classList.add('playlist-track__album');
    playBtn.classList.add('playlist-track__play-btn');
    // playBtn.classList.add('playlist-track__play-container');

    moreOptions.classList.add('options');
    moreOptionsDropdown.classList.add('options-dropdown');
    goToLink.classList.add('options-dropdown__link', 'go-to-link');
    moveToAPlaylist.classList.add('options-dropdown__link', 'move-song');
    deleteTrack.classList.add('options-dropdown__link', 'delete-modal-trigger');



    // Setting DOM display
    let spotifyURL = 'https://open.spotify.com/track/';
    goToLink.setAttribute('href', `${spotifyURL}${processSongURI(newPlaylistTrack.uri)}`);
    goToLink.setAttribute('target', '_blank');
    trackLink.setAttribute('href', newPlaylistTrack.preview_url);
    playBtn.setAttribute('href', newPlaylistTrack.preview_url);
    playlistTrackDiv.setAttribute('data-spotify-track', newPlaylistTrack.uri);

    img.src = newPlaylistTrack.album_img.url;
    
    headings.h1.textContent = newPlaylistTrack.song_title;
    headings.h2.textContent = newPlaylistTrack.artist;
    headings.h4.textContent = newPlaylistTrack.album_name;

    
    goToLink.textContent = "Go to song link";
    moveToAPlaylist.textContent = "Move song to another playlist";
    deleteTrack.textContent = "Delete track";

    

    moreOptions.textContent = '\u2026';


    let playerControl = document.createElement('div');
    
    playerControl.classList.add('playlist-track__media');

    playerControl.innerHTML = '<svg class="media-controls" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><path class="media-controls__pause inactive-dash-pause" stroke="#3F3E3E" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M48,25 L48,71.8053097 C45.1666667,73.6017699 42.3333333,74.5 39.5,74.5 C36.6666667,74.5 33.8333333,73.6017699 31,71.8053097"/><path class="media-controls__play inactive-dash" stroke-linecap="round" stroke="#3F3E3E" stroke-width="5" d="M72.0763886,68.3352333 L62.1474475,68.3352333 L27.2723011,68.3352333 C25.0631621,68.3352333 23.2723011,66.5443723 23.2723011,64.3352333 C23.2723011,63.4859068 23.542644,62.6586256 24.0441798,61.9731933 L46.4462236,31.3570669 C47.7507422,29.5742247 50.2535427,29.1864669 52.0363849,30.4909855 C52.3678287,30.7335054 52.6599463,31.025623 52.9024662,31.3570669 L75.3045099,61.9731933 C76.6090286,63.7560355 76.2212708,66.258836 74.4384286,67.5633546 C73.7529963,68.0648904 72.9257152,68.3352333 72.0763886,68.3352333 L68.7548694,68.3352333" transform="rotate(90 49.674 49.027)"/></g></svg>';
    

    // playBtn.firstElementChild.classList.add('playlist-track__play-svg');

    // Attach to DOM 
    userChosenPlaylist.appendChild(playlistTrackDiv);
    playlistTrackDiv.appendChild(img);
    // playlistTrackDiv.appendChild(songTrack);
    img.appendChild(trackLink);
    playlistTrackDiv.appendChild(headingContainer);
    headingContainer.appendChild(headings.h1);
    headingContainer.appendChild(headings.h2);
    playlistTrackDiv.appendChild(playerControl);
    
    // playBtnContainer.appendChild(playBtn);
    playlistTrackDiv.appendChild(moreOptions);
    // playlistTrackDiv.appendChild(playlistAddBtn);

    moreOptions.appendChild(moreOptionsDropdown);
    moreOptionsDropdown.appendChild(goToLink);
    moreOptionsDropdown.appendChild(moveToAPlaylist);
    moreOptionsDropdown.appendChild(deleteTrack);

    // Preview Songs... set up in tracks div
    // let audioTrack = new Audio(trackLink.href);  
      
    img.addEventListener('click', (evt) => {

        // evt.preventDefault();
        
        let playlistTrack = Array.from(evt.target.parentElement.children);

        console.dir(playlistTrack);

        playlistTrack.forEach( (child) =>{
            if(child.className === 'playlist-track__media'){
                let playSVG = child.firstChild;
                let pausePath = playSVG.firstChild.firstChild;
                let playPath = playSVG.firstChild.lastChild;

                playPath.classList.remove('inactive-dash');
                pausePath.classList.remove('inactive-dash-pause');

                playPath.classList.toggle('play-ani');
                pausePath.classList.toggle('pause-ani');
            }
        })


        evt.target.firstElementChild.paused ? evt.target.firstElementChild.play() : evt.target.firstElementChild.pause(); 

        // let playBtn = document.querySelector('.media-controls__play');
        // let pauseBtn = document.querySelector('.media-controls__pause');
        // playBtn.classList.remove('inactive-dash');
        // pauseBtn.classList.remove('inactive-dash-pause');
        
        // playBtn.classList.toggle('play-ani');
        // pauseBtn.classList.toggle('pause-ani');
    });

    playerControl.addEventListener('click', (evt) => {

        console.log(evt.target)

        let gSVG = evt.target.firstChild;
        let pausePath = gSVG.firstChild;
        let playPath = gSVG.lastChild;

        playPath.classList.remove('inactive-dash');
        pausePath.classList.remove('inactive-dash-pause');

        playPath.classList.toggle('play-ani');
        pausePath.classList.toggle('pause-ani');

        let audioTrack = Array.from(evt.target.parentElement.parentElement.children);

        audioTrack.forEach((child) =>{
            if(child.className === 'playlist-track__img'){
                let songAudio = child.firstChild;
                songAudio.paused ? songAudio.play() : songAudio.pause(); 
            }
        })
        // audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
        // let playBtn = document.querySelector('.media-controls__play');
        // let pauseBtn = document.querySelector('.media-controls__pause');

        // if(evt.target.classList.contains())
        // console.dir(evt.target);

        // playBtn.classList.remove('inactive-dash');
        // pauseBtn.classList.remove('inactive-dash-pause');
        
        // playBtn.classList.toggle('play-ani');
        // pauseBtn.classList.toggle('pause-ani');
        
    });



}

// ****************************************************************************************

// For songs that are in the body
function getSongURI(evt){
    songReference = evt.parentElement.getElementsByTagName('a')[0].href;
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



moveSongModal.addEventListener('submit', (evt) => {
        // Grab selection chosen from a User
        evt.preventDefault();
        let mvsSelect = document.querySelector('.mvs-select');
        mvsSelect.parentNode.removeChild(mvsSelect);
        
        let moveSong = [deleteThis];
        let moveToThisPlaylist;
        playlistNameValue = mvsSelect.value;

        moveToThisPlaylist = getPlaylistID(playlistNameValue);
        
        moveSongModal.classList.toggle("mvs-modal__show-modal");
           
        deleteSong(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, deleteThis)
            .then((response) => {
                response.json();
            })
            .then((data) => {
                // Get back updated playlist *** code from add songs to playlist section ** place into function 
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`)
                .then((playlist) => {
                    return playlist.json();
                })
                
                .then( (updatedPlaylist) => {
                    
                    
                    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
                    let counter = 0;
                    let updateThisPlaylist;
                    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
                    
        
                    trackWrapper.forEach( (wrapper) => {
                        if(wrapper.parentElement.childNodes[0].textContent === currentChosenPlaylist.name){
                            updateThisPlaylist = wrapper;
                        }
                    });
        
                    // This is for dealing with the DOM's live list
                    for (let i = updateThisPlaylist.children.length; i--; ) {
                        updateThisPlaylist.children[i].remove();
                     }
        
                    updatedPlaylist.items.forEach( (playlistSong) => {
        
                        createPlaylistBody(playlistSong);
                    });
        
                    
                })
                .then((afterUpdate) => {
                    moveSongFromPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${moveToThisPlaylist}/tracks`, moveSong, moveToThisPlaylist);
                });
                
            })
            .catch((err) => {
                console.log(err);
            });

});

// Delete song from Playlist
document.querySelector('.delete-modal__content').addEventListener('submit', (evt) => {
    
        evt.preventDefault();
        deleteModal.classList.toggle("delete-modal__show-modal");
        
            
        deleteSong(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, deleteThis)
            .then((response) => {
                response.json();
            })
            .then((data) => {
                // Get back updated playlist *** code from add songs to playlist section ** place into function 
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`)
                .then((playlist) => {
                    return playlist.json();
                })
                .then( (updatedPlaylist) => {
                    
                    
                    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
                    let counter = 0;
                    let updateThisPlaylist;
                    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
                    
                    trackWrapper.forEach( (wrapper) => {
                        if(wrapper.parentElement.childNodes[0].textContent === currentChosenPlaylist.name){
                            updateThisPlaylist = wrapper;
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
});


Array.from(document.getElementsByClassName('cr-pl__btn')).forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        modal.style.display = "block";
    });
});

// Modal's Close Button
document.querySelectorAll('.close-btn').forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        deleteModal.classList.remove("delete-modal__show-modal");
        modal.style.display = "none";

        let mvsModal = document.querySelector('.mvs-modal__content');
        let selectMvs = document.querySelector('.mvs-select');
        moveSongModal.classList.remove("mvs-modal__show-modal");
    });
});


// When the user clicks anywhere outside of the modal, close it
window.addEventListener('click', (evt) => {
    let optionsDropDown = document.querySelector('.show__options');
    let options = document.querySelector('.options');

    // Creating/Importing a playlist modal view
    if (evt.target == modal) {
        modal.style.display = "none";
    }
    // Delete song modal view
    if (evt.target === deleteModal) {
        deleteModal.classList.toggle("delete-modal__show-modal");
    }
    // Move playlist modal view
    if (evt.target === moveSongModal) {
        let mvsModal = document.querySelector('.mvs-modal__content');
        let selectMvs = document.querySelector('.mvs-select');
        moveSongModal.classList.toggle("mvs-modal__show-modal");

        selectMvs.parentNode.removeChild(selectMvs);
    }

    // More Options on playlist Tracks
    if (evt.target !== optionsHelper) {
        let dropdowns = document.getElementsByClassName("options-dropdown");

        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove("show__options");
        }
      }

});



// Expand playlist footer
document.querySelector('.playlist').addEventListener('click', (evt) => {
    evt.stopPropagation();
    const playlist = document.querySelector('.playlist');
    const createBtn = document.querySelector('.playlist-create');
    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
    const importTab = document.getElementById('im-pl-tab');
    const createTab = document.getElementById('cr-pl-tab');

    if(evt.target.className === 'playlist-bar'){
        playlist.classList.toggle('extended-playlist');
    }
    if(playlist.classList.contains('extended-playlist')){
        createBtn.textContent = 'Create New Playlist +';
    }

    if(!playlist.classList.contains('extended-playlist')){
        createBtn.textContent = '+';
    }

    if(evt.target.className === 'playlist-import'){
        importTab.checked = true;
        modal.style.display = 'block';
    }

    if(evt.target.className === 'playlist-create'){
        createTab.checked = true;
        modal.style.display = 'block';
    }

    let playlistID;
    let playlistName;

    // Playlist Name & ID
    if(evt.target.className === "playlist-list__name"){
        playlistName = evt.target.childNodes[0].textContent || ''; // need to fix
        
        currentChosenPlaylist.name = playlistName; 

        // Playlist ID
        for(let k in totalPlaylists){
            if(playlistName === totalPlaylists[k].name) {
                // currentChosenPlaylist.name = totalPlaylists[k].name;
                currentChosenPlaylist.id = totalPlaylists[k].id;
            }
        }

    }

    // Remove a playlist
    if(evt.target.className === 'remove-playlist'){
        // Create Modal Box
        let modal = document.createElement('div');
        let modalContent = document.createElement('div');
        const removeWrap = document.createElement('div');

        // Modal Box Remove Content
        let removePlaylistContent = document.createElement('form');
        let removeHeading = document.createElement('h1');
        let successBtn = document.createElement('button');
        let exitBtn = document.createElement('button');

        removeHeading.textContent = `Are you sure you'd like to remove playlist "${evt.target.parentElement.childNodes[0].textContent}"?`;
        successBtn.textContent = `Yes`;
        exitBtn.textContent = `No`;
        

        //   evt.target.parentElement.parentElement.removeChild(evt.target.parentElement)
        let deleteMe = evt.target.parentElement.parentElement;

        // Create a function that just creates the modal and adds it to the body
        modal.classList.add('modal');
        modalContent.classList.add('modal-content');

        modal.style.display = 'block';
        exitBtn.setAttribute('type', 'button');
        removePlaylistContent.setAttribute('method', 'get');
    
        exitBtn.addEventListener('click', (evt) => {
            modal.style.display = 'none';
        });

        removePlaylistContent.addEventListener('submit', (evt) => {
            
            evt.preventDefault();
            modal.style.display = 'none';
            deleteMe.removeChild(deleteMe.firstChild);
            removeFromTotalPlaylists(evt.target.parentElement.childNodes[0].textContent);
            // updatePlaylistCount();
        });
        
        
        
        document.body.appendChild(modal);
        modal.appendChild(modalContent);
        modalContent.appendChild(removeWrap);
        removeWrap.appendChild(removePlaylistContent);
        removePlaylistContent.appendChild(removeHeading);
        removePlaylistContent.appendChild(exitBtn);
        removePlaylistContent.appendChild(successBtn);
    }

    // Delete Song Modal
    if(evt.target.classList.contains("delete-modal-trigger")){
            
        deleteThis = evt.target.parentElement.parentElement.parentElement.getAttribute('data-spotify-track');
        
        let deleteModal = document.querySelector('.delete-modal');
        evt.stopPropagation();
        
        let songDelete = document.querySelector('.song-delete');
        let artistDelete = document.querySelector('.artist-delete');
        let deleteFromPlaylist = document.querySelector('.delete-from-playlist');
    
        songDelete.textContent = 'Song';
        artistDelete.textContent = 'Artist';
        deleteFromPlaylist.textContent = currentChosenPlaylist.name;

        
        deleteModal.classList.toggle("delete-modal__show-modal");
    }
        
    // Move Song from one playlist to another
    if(evt.target.classList.contains("move-song")){
        deleteThis = evt.target.parentElement.parentElement.parentElement.getAttribute('data-spotify-track');
        let moveModal = document.querySelector('.mvs-modal');
        evt.stopPropagation();
        
        let songDelete = document.querySelector('.song-mvs');
        let artistDelete = document.querySelector('.artist-mvs');

        
        let playlistSelect = document.createElement('select');
        let playlistOptions = document.createElement('option');

        let deleteAppend = document.querySelector('.mvs-delete-modal-btn');

        for(let i = 0; i < totalPlaylists.length; i++){

            if(currentChosenPlaylist.name !== totalPlaylists[i].name){
                playlistOptions = document.createElement('option');
                playlistOptions.setAttribute('value', totalPlaylists[i].name);
                playlistOptions.setAttribute('data-playlistId', totalPlaylists[i].id);
                playlistOptions.textContent = totalPlaylists[i].name;

                playlistSelect.appendChild(playlistOptions);
            }
        }

        playlistSelect.classList.add('mvs-select');

        // mvsModal.appendChild(playlistSelect);
        deleteAppend.parentNode.insertBefore(playlistSelect, deleteAppend);
        
    
        songDelete.textContent = 'Song';
        artistDelete.textContent = 'Artist';
        
        moveModal.classList.toggle('mvs-modal__show-modal');
    }

    // More options drop down
    if(evt.target.className === 'options'){
        optionsHelper = evt.target;
        console.dir(evt.target)
        evt.target.firstElementChild.classList.toggle('show__options');
    }

    // Show trackwrapper on click showing playlist tracks
    if(evt.target.classList.contains('playlist-list__name')){
        let playlistNames = document.querySelectorAll('.playlist-list__name');

        // evt.target.classList.toggle('active-playlist');

        playlistNames.forEach((playlist) =>{
            if(evt.target !== playlist){
                playlist.classList.toggle('playlist-list__name--hide')
            }
        })

        evt.target.firstElementChild.classList.toggle('track-wrapper--show');


        
        // if(trackWrapper.contains('track-wrapper--show')){
           evt.target.style.height = 'auto';
        // }
    }


});


// Genre search filter
document.querySelector('.genres-filter__search').addEventListener('keyup', () => {
    let input;
    let filter;
    input = document.getElementsByClassName('genres-list__item');
    filter = document.querySelector('.genres-filter__search').value.toUpperCase();

    // Loop through all list items, and hide those who don't match the search query
    for (i = 0; i < input.length; i++) {
        let currentElem = input[i];
        if (currentElem.textContent.toUpperCase().indexOf(filter) > -1) {
            currentElem.style.display = "";
        } else {
            currentElem.style.display = "none";
        }
      }
});


// Genres Section
document.querySelector('.genres').addEventListener('click', (evt) => {
    evt.stopPropagation();

    // Genres Dropdown
    if(evt.target.classList.contains('genres-drop__header')){
        let rightCaret = document.querySelector('.fa-caret-right');
        let fixedLogo = document.querySelector('.logo-container');
        let isMobile = false;
        let genresDiv = document.querySelector('.genres');
        let cssProp = window.getComputedStyle(fixedLogo, null).getPropertyValue("position");

        // Set up Mobile Genre Header
        if(cssProp == 'fixed'){
            isMobile = true;  
        }

        if(isMobile == true) {
            genresDiv.classList.toggle('genres-mb');
            document.querySelector('.genres-drop__header').classList.toggle('genres-drop__header-mb');
        }

        // Genre Caret Animation 
        rightCaret.classList.remove('no-transform');
        rightCaret.classList.toggle('genres-active-animation');
        document.querySelector('.genres-filter__toggle').classList.toggle('genres-show');
        }
    

    // Clear All Genres Button
    if(evt.target.className === 'genres-filter-tab__clear'){
        let filterList = document.querySelector('.genres-filter-tab__list');
        let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
        let moodDiv = document.querySelector('.mood-filter-genre');
        chosenGenres.forEach( (genre) => {
            genre.classList.remove('genres-toggle');
        });

        while (filterList.firstChild) {
            filterList.removeChild(filterList.firstChild);
        } 
        while (moodDiv.firstChild) {
            moodDiv.removeChild(moodDiv.firstChild);
        } 
    }

    if(evt.target.classList.contains('genres-list__item')){
        
        let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
        let chosenGenresLength = document.querySelectorAll('.genres-toggle').length;
        let filterList = document.querySelector('.genres-filter-tab__list');
        let moodDiv = document.querySelector('.mood-filter-genre');
        // let filterTags = document.querySelectorAll('.genres-filter-tab__tag');

        let filterTags = document.querySelectorAll('.genres-filter-tab__tag');
        let searchFilterTags = document.querySelectorAll('.mood-filter-genre__tag');
        

        // while (filterList.firstChild) {
        //     filterList.removeChild(filterList.firstChild);
        // } 
        // while (moodDiv.firstChild) {
        //     moodDiv.removeChild(moodDiv.firstChild);
        // } 

        // sortedChosenGenres.filter( () =>{
        //     return item !==  
        // })

        

        if(chosenGenresLength > 4) {

            filterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            })
            searchFilterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            })

            evt.target.classList.remove("genres-toggle");
            
            let currentGenres = Array.from(document.querySelectorAll('.genres-toggle'));
        

        }
        else if(evt.target.classList.contains('genres-toggle')){
            filterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            })
            searchFilterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            })
            evt.target.classList.remove('genres-toggle')
        }
        
        else{
            
            evt.target.classList.toggle("genres-toggle");
            let moodDiv = document.querySelector('.mood-filter-genre');
            let currentGenres = Array.from(document.querySelectorAll('.genres-toggle'));
            let isMobile = false;
            let newnewnew = document.querySelector('.logo-container');
            let cssProp = window.getComputedStyle(newnewnew, null).getPropertyValue("position");
            
            
            sortedChosenGenres.push(evt.target.textContent);
            
            let listItem = document.createElement('li');
            let spanItem = document.createElement('span');
            let closeIcon = document.createElement('i');
           
            spanItem.textContent = evt.target.textContent;
            listItem.textContent = evt.target.textContent;
            spanItem.classList.add('mood-filter-genre__tag');
            listItem.classList.add('genres-filter-tab__tag');
            closeIcon.className = 'fas fa-times genres-filter-tab__x';
            filterList.appendChild(listItem);
            listItem.appendChild(closeIcon);

            

            // Set up Mobile Genre Header
            if(cssProp == 'fixed'){
                isMobile = true;  
            }

            if(isMobile !== true) {
                moodDiv.appendChild(spanItem);
            }

            
        }
    }

    // Genre Tags
    if(evt.target.className === 'genres-filter-tab__tag'){
        let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
        let searchFilterTags = document.querySelectorAll('.mood-filter-genre__tag');

        chosenGenres.forEach((genre) => {
            if(evt.target.textContent === genre.textContent){
                genre.classList.remove('genres-toggle');
                // genre.remove();
            }
        });

        searchFilterTags.forEach((pickedGenre) => {
            if(evt.target.textContent === pickedGenre.textContent){
                pickedGenre.remove();
            }
        })

        evt.target.classList.remove('genres-filter-tab__tag');
        evt.target.remove();
        console.log('click event works')
    }


});




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
        
    });
})
.catch((err) => {
    console.log(err);
});

// Show music
document.querySelector('.mood__form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    const userMood = document.querySelector('.mood__val');
    const userMoodValue = userMood.value.toLowerCase();
    const trackContainer = document.querySelector('.track-container');
    const tracksDiv = document.querySelector('.tracks');
    const showPlaylist = document.querySelector('.playlist');

    let genresChosen = Array.from(document.querySelectorAll('.genres-toggle'));
    let storeGenres = [];
    const regForGenres = /&/g;

    
    genresChosen.forEach((genre) => {
        let genreName = genre.textContent.toLowerCase();
        if(genreName === 'r & b' || genreName === 'rock & roll'){
            genreName = genre.textContent.replace(regForGenres, 'n').toLowerCase();
            
        } 
        if(genreName === 'drum & bass'){
            genreName = genre.textContent.replace(regForGenres, 'and').toLowerCase();
        }

        genre.classList.remove('genres-toggle');
        genreName = genreName.replace(/ /g, '-');
        storeGenres.push(genreName);
    });
    
    // playlistExtended.style.display = 'none';
    showPlaylist.style.display = 'flex';
    
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

        let newUrl = handleGenres(url, storeGenres); 
        spotifyProcessTracks(newUrl);   
    
        // Infinite Scroll
        document.addEventListener('scroll', function() {
            let scrollPosition = window.pageYOffset;
            let windowSize = window.innerHeight;
            let bodyHeight = document.body.offsetHeight;
            
            if(scrollPosition + windowSize >= bodyHeight){
                let scrollUrl = handleGenres(url, storeGenres);
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

            document.querySelector('.im-pl__name').value = '';

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

                // Give message, sorry there's no playlist matching this name out of your playlists
                if(!importedPlaylistID) {
                    let inputDiv = document.querySelector('.im-pl');
                    let errorMessage = document.createElement('span');

                    errorMessage.textContent = `Sorry there's no playlist matching this name "${importPlaylistName}" out of your Spotify playlists!`;

                    inputDiv.appendChild(errorMessage);
                    return 1;
                }
                
                
                let playlistExists = updateTotalPlaylists(importPlaylistName, importedPlaylistID);
    
                // A playlist with this name has already been imported
                if(playlistExists){ 
                    let inputDiv = document.querySelector('.im-pl');
                    let errorMessage = document.createElement('span');

                    errorMessage.textContent = `A playlist with the name "${importPlaylistName}" has already been imported.`;

                    inputDiv.appendChild(errorMessage);
                    return 1;
                }

                
                playlistPlate(importPlaylistName, importedPlaylistID);
                // updatePlaylistCount();


                // Fetch for that specfic ID
                // Fetch that URL get the returned tracks and put into creat Playlist tracks
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${importedPlaylistID}/tracks`)
                .then((response) => {
                    return response.json();
                })
                .then((importedTracks) => {
                    importedTracks.items.forEach( (playlistSong) => {

                        createPlaylistBody(playlistSong, importPlaylistName);
                    });

                });

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
