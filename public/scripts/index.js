const access_token = getParameterByName("access_token");

const createPlaylistSubmit = document.querySelector('.cr-pl__submit');
const importPlaylistSubmit = document.querySelector('.im-pl__submit');

let closureURL;

// Counting on being manipulated
let currentTracks = [];
const userInfo = {};
let totalPlaylists = [];
let songQueue = [];
var currentChosenPlaylist = {};
let sortedChosenGenres = [];


const playlistExtended = document.querySelector('.playlist-extended');

let deleteThis;
let playlistNameValue;
let optionsHelper;

// Variables for Remove Playlist
let deleteMe;
let grandparentOfTarget;

// let successBtn = document.querySelector('.success-btn');

// Random Color for Playlist
function randomColor(){
    let colors = ['#E8A5A5', '#783E3E', '#BF4949', '#D15273'];
    var randomColor = colors[Math.floor(Math.random() * colors.length)];

    return randomColor;
}

// Close Modal
function closeModal(){
    let tranModal = document.querySelector('.tran-modal__show-modal');
    let removePlaylistForm = document.querySelector('.tran-modal__show-form');
    let selectMvs = document.querySelector('.mvs-select');
    let crImPlaylistModalDisplayed = document.querySelector('.modal--show');
    let songAttachment = document.querySelector('.song-action');
    let importErrorMessage = document.querySelector('.im-pl__error');
    
    if(songAttachment){
        removeElementFromDOM(songAttachment);
    }
    
    
    if(tranModal){
        tranModal.classList.toggle('tran-modal__show-modal');
        removePlaylistForm.classList.toggle('tran-modal__show-form');
    }
    if(selectMvs){
        removeElementFromDOM(selectMvs);
    }
    if(crImPlaylistModalDisplayed){
        crImPlaylistModalDisplayed.classList.toggle('modal--show');
    }
    if(importErrorMessage){
        removeElementFromDOM(importErrorMessage);
    }
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

// Songs Added to Modal Action Confirmation
function modalSongBodyAttachment(element){

    let ancestorElem = element.parentElement.parentElement.parentElement;
    let songImg = ancestorElem.childNodes[0].src;
    let songName = ancestorElem.childNodes[1].childNodes[0].textContent;
    let artistName = ancestorElem.childNodes[1].childNodes[1].textContent;
    deleteThis = ancestorElem.getAttribute('data-spotify-track');        

    let songBody = {
        songAction: document.createElement('div'),
        songActionInfo: document.createElement('div'),
        songActionImg: document.createElement('img'),
        songActionName: document.createElement('h5'),
        songActionArtist: document.createElement('h6')
    };

    songBody.songAction.classList.add('song-action');
    songBody.songActionInfo.classList.add('song-action__song-info');
    songBody.songActionImg.classList.add('song-action__img');
    songBody.songActionName.classList.add('song-action__song-name');
    songBody.songActionArtist.classList.add('song-action__song-artist');

    songBody.songActionImg.setAttribute('src', songImg);
    songBody.songActionName.textContent = songName;
    songBody.songActionArtist.textContent = artistName;

    songBody.songAction.appendChild(songBody.songActionImg);
    songBody.songAction.appendChild(songBody.songActionInfo);
    songBody.songActionInfo.appendChild(songBody.songActionName);
    songBody.songActionInfo.appendChild(songBody.songActionArtist);

    

    return songBody;

}


// Takes a String as an argument for Import Modal Error Message
function createImportError(errorMessage){
    let errorBody = document.createElement('span');
    let contentBox = document.querySelector('.content__import');
    let inputHook = document.querySelector('.im-pl__name');
    
    contentBox.classList.add('tab-content--error');
    errorBody.classList.add('im-pl__error');

    errorBody.textContent = errorMessage;


    inputHook.parentNode.insertBefore(errorBody, inputHook.nextElementSibling);
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


function getChildElementByClass(element, className){
    // Check if element already contains class
    if(element.classList.contains(className)){
        return element;
    }
    else{
        let elementChildren = element.childNodes;

        for(let i = 0; i < elementChildren.length; i++){
            if(elementChildren[i].classList.contains(className)){
                return elementChildren[i];
            }
        
                // getChildElementByClass(elementChildren[i], className);

                // for(let j = i; j < elementChildren.length; j++){
                //     getChildElementByClass(elementChildren[i], className);
                // }

    
        }
    }
    // If no element by that class is found
    // return undefined;
}

function getTheClass(element, className){
    let elementChildren = element.childNodes;

        for(let i = 0; i < elementChildren.length; i++){
            if(elementChildren[i].classList.contains(className)){
                return elementChildren[i];
            }
            // else{
                // getChildElementByClass(elementChildren[i], className);

                // for(let j = i; j < elementChildren.length; j++){
                //     getChildElementByClass(elementChildren[i], className);
                // }

            // }
        }
}


// Playlist Template
function playlistPlate(name, id){
    const playlistList = document.querySelector('.playlist-list');
    const playlistDiv = document.createElement('div');
    const trackWrapper = document.createElement('div');
    const playlistName = document.createElement('h4');
    const removePlaylist = document.createElement('span');
    let currentShownPlaylist = document.querySelector('.playlist-list__playlist--show');
    
    let optionsDropSelection = document.getElementsByClassName('options-dropdown__link');

    // playlistDiv.textContent = name;
    playlistName.textContent = name;
    // removePlaylist.textContent = 'x';



    playlistDiv.classList.add('playlist-list__playlist');
    playlistName.classList.add('playlist-list__name');
    trackWrapper.classList.add('track-wrapper');
    removePlaylist.classList.add('remove-playlist');

    if(currentShownPlaylist){
        playlistDiv.classList.add('playlist-list__playlist--hide');
    }

    playlistDiv.setAttribute('data-playlist-id', id);
    playlistDiv.style.backgroundColor = randomColor();

    currentChosenPlaylist.name = name;
    currentChosenPlaylist.id = id;


    playlistList.appendChild(playlistDiv);
    playlistDiv.appendChild(playlistName);
    playlistDiv.appendChild(trackWrapper);
    playlistDiv.appendChild(removePlaylist); // Unsure may break code
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
            refreshPlaylistBody(currentChosenPlaylist.name);

            updatedPlaylist.items.forEach( (playlistSong) => {
                createPlaylistTrackBody(playlistSong);
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });


}


// Create DOM structure from Fetched songs
function createSongBody(trackObj){
    
    const div = document.createElement('div');
    const img = document.createElement('img');
    // const trackLink = document.createElement('a');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    const playlistAddBtn = document.createElement('button');
    const getDiv = document.querySelector('.tracks');
    const progressBar = document.createElement('div');
    const trackLink = document.createElement('audio');
    const playerControl = document.createElement('div');

    playerControl.classList.add('track__media');

    playerControl.innerHTML = '<svg class="media-controls" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><path class="media-controls__pause inactive-dash-pause" stroke="#3F3E3E" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M48,25 L48,71.8053097 C45.1666667,73.6017699 42.3333333,74.5 39.5,74.5 C36.6666667,74.5 33.8333333,73.6017699 31,71.8053097"/><path class="media-controls__play inactive-dash" stroke-linecap="round" stroke="#3F3E3E" stroke-width="5" d="M72.0763886,68.3352333 L62.1474475,68.3352333 L27.2723011,68.3352333 C25.0631621,68.3352333 23.2723011,66.5443723 23.2723011,64.3352333 C23.2723011,63.4859068 23.542644,62.6586256 24.0441798,61.9731933 L46.4462236,31.3570669 C47.7507422,29.5742247 50.2535427,29.1864669 52.0363849,30.4909855 C52.3678287,30.7335054 52.6599463,31.025623 52.9024662,31.3570669 L75.3045099,61.9731933 C76.6090286,63.7560355 76.2212708,66.258836 74.4384286,67.5633546 C73.7529963,68.0648904 72.9257152,68.3352333 72.0763886,68.3352333 L68.7548694,68.3352333" transform="rotate(90 49.674 49.027)"/></g></svg>';

    // Setting up classes
    trackLink.classList.add('track__link');
    div.classList.add('track');
    img.classList.add('track__img');
    headings.h1.classList.add('track__name');
    headings.h2.classList.add('track__arist');
    headings.h4.classList.add('track__album');
    playlistAddBtn.classList.add('track__pl-add', 'cr-pl__btn');
    // progressBar.classList.add('track__progress');
    playerControl.classList.add('track__media');

    // Setting DOM display
    // trackLink.setAttribute('href', trackObj.preview_url);
    trackLink.src = trackObj.preview_url;

    img.src = trackObj.album_img.url;
    headings.h1.textContent = trackObj.song_title;
    headings.h2.textContent = trackObj.artist;
    headings.h4.textContent = trackObj.album_name;


    // Attach to DOM 
    getDiv.appendChild(div);
    div.appendChild(img);
    img.appendChild(trackLink);
    // div.appendChild(progressBar);
    div.appendChild(playerControl);
    div.appendChild(headings.h1);
    div.appendChild(headings.h4);
    div.appendChild(headings.h2);
    div.appendChild(playlistAddBtn);

    // let progressBar = document.createElement('div');
    progressBar.classList.add('track__progress-bar');

    let volumeIcon = document.createElement('i');
    const volumeContainer = document.createElement('div');
    const volumeSlider = document.createElement('input');

    volumeSlider.setAttribute('type', 'range');
    volumeSlider.setAttribute('min', '1');
    volumeSlider.setAttribute('max', '100');
    volumeSlider.setAttribute('value', '60');

    volumeContainer.classList.add('track__volume-container');
    volumeSlider.classList.add('track__volume-slider');
    volumeIcon.classList.add('track__volume-icon');

    volumeIcon.className = 'fas fa-volume-up';

    volumeContainer.appendChild(volumeIcon);
    volumeContainer.appendChild(volumeSlider);

    playerControl.insertAdjacentElement('afterbegin', progressBar);
    playerControl.insertAdjacentElement('beforeend', volumeContainer);

    // Preview Songs change to add an audio event
    let audioTrack = new Audio(trackLink.href);    
    trackLink.addEventListener('click', (evt) => {
        evt.preventDefault();
        
        audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
    });


    img.addEventListener('click', (evt) => {

        // evt.preventDefault();
        
        let playlistTrack = Array.from(evt.target.parentElement.children);

        console.dir(playlistTrack);

        playlistTrack.forEach( (child) =>{
            if(child.className === 'track__media'){
                let playSVG = child.firstChild;
                let pausePath = playSVG.firstChild.firstChild;
                let playPath = playSVG.firstChild.lastChild;

                playPath.classList.remove('inactive-dash');
                pausePath.classList.remove('inactive-dash-pause');

                playPath.classList.toggle('play-ani');
                pausePath.classList.toggle('pause-ani');
            }
        });


        evt.target.firstElementChild.paused ? evt.target.firstElementChild.play() : evt.target.firstElementChild.pause(); 
    });

    playerControl.addEventListener('click', (evt) => {
        // refactor into track event listener
        if(evt.target.classList.contains('media-controls')){
            let gSVG = evt.target.firstChild;
            console.log(gSVG);
            console.dir(gSVG);
            let pausePath = gSVG.firstChild;
            let playPath = gSVG.lastChild;
    
            
            playPath.classList.remove('inactive-dash');
            pausePath.classList.remove('inactive-dash-pause');
    
            playPath.classList.toggle('play-ani');
            pausePath.classList.toggle('pause-ani');
    
            let audioTrack = Array.from(evt.target.parentElement.parentElement.children);
    
            audioTrack.forEach((child) =>{
                if(child.className === 'track__img'){
                    let songAudio = child.firstChild;
                    songAudio.paused ? songAudio.play() : songAudio.pause(); 
                }
            });
        }

        
       
        
    });

       
    // Add tracks to playlist
    playlistAddBtn.addEventListener('click', (evt) => {
        let addedSong = [getSongURI(evt.target)];
        let crImPlaylistModal = document.querySelector('.modal');

        if(totalPlaylists.length === 0){
            let queuedSong = getSongURI(evt.target);
            songQueue.push(queuedSong);
            
            // Pop out Playlist create modal..change to toggle class
            
            crImPlaylistModal.classList.toggle('modal--show');
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

    trackLink.addEventListener("playing", (evt) => {
        let song = evt.target;

        let duration = song.duration;
        let parentOfEvent = song.parentElement.parentElement;
        let progressBar = getChildElementByClass(parentOfEvent, 'track__media').firstElementChild;
        
        advance(duration, trackLink, progressBar);
        console.dir(evt.target)
        
        console.dir(progressBar);
        console.log(trackLink.volume);

        console.log(duration)
        

      });
}

// Need to see what can be refactored from this and createSongBody function
function createPlaylistTrackBody(playlistObj, importedPlaylistName){

    const playlistTrackDiv = document.createElement('div');
    const playerControl = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('audio');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };

    // Dropdown for playlist
    const options = document.createElement('div');
    const optionsDropdown = document.createElement('div');
    const playBtn = document.createElement('a');
    
    const songInfoContainer = document.createElement('div');
    const goToLink = document.createElement('a');
    const moveToAPlaylist = document.createElement('a');
    const deleteTrack = document.createElement('a');
    
    let userChosenPlaylist;
    let playlistNameBar = document.querySelectorAll('.playlist-list__playlist');
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

    playlistNameBar.forEach( (childElement) => {
        if(importedPlaylistName){
            if(childElement.childNodes[0].textContent === importedPlaylistName){
                userChosenPlaylist = getChildElementByClass(childElement, 'track-wrapper');
            }
        }
        else if(childElement.childNodes[0].textContent === currentChosenPlaylist.name){
            userChosenPlaylist = getChildElementByClass(childElement, 'track-wrapper');
        }
    });

    // If user made requests to add songs without a playlist, this will point to the first playlist.
    if(userChosenPlaylist === undefined){
        userChosenPlaylist = getChildElementByClass(playlistNameBar[0], 'track-wrapper');
    }

    // Setting up classes
    trackLink.classList.add('playlist-track__link');
    playlistTrackDiv.classList.add('playlist-track'); // 'playlist-track',
    img.classList.add('playlist-track__img');
    songInfoContainer.classList.add('playlist-track__song-info-container');
    headings.h1.classList.add('playlist-track__name');
    headings.h2.classList.add('playlist-track__arist');
    headings.h4.classList.add('playlist-track__album');
    playBtn.classList.add('playlist-track__play-btn');
    
    // Dropdown Options Classes
    options.classList.add('options');
    optionsDropdown.classList.add('options-dropdown');
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

    // Dropdown Options Text
    goToLink.textContent = "Go to song link";
    moveToAPlaylist.textContent = "Move song to another playlist";
    deleteTrack.textContent = "Delete track";

    options.textContent = '\u2026';


    // Play-Pause SVG
    playerControl.classList.add('playlist-track__media');

    playerControl.innerHTML = '<svg class="media-controls" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><path class="media-controls__pause inactive-dash-pause" stroke="#3F3E3E" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M48,25 L48,71.8053097 C45.1666667,73.6017699 42.3333333,74.5 39.5,74.5 C36.6666667,74.5 33.8333333,73.6017699 31,71.8053097"/><path class="media-controls__play inactive-dash" stroke-linecap="round" stroke="#3F3E3E" stroke-width="5" d="M72.0763886,68.3352333 L62.1474475,68.3352333 L27.2723011,68.3352333 C25.0631621,68.3352333 23.2723011,66.5443723 23.2723011,64.3352333 C23.2723011,63.4859068 23.542644,62.6586256 24.0441798,61.9731933 L46.4462236,31.3570669 C47.7507422,29.5742247 50.2535427,29.1864669 52.0363849,30.4909855 C52.3678287,30.7335054 52.6599463,31.025623 52.9024662,31.3570669 L75.3045099,61.9731933 C76.6090286,63.7560355 76.2212708,66.258836 74.4384286,67.5633546 C73.7529963,68.0648904 72.9257152,68.3352333 72.0763886,68.3352333 L68.7548694,68.3352333" transform="rotate(90 49.674 49.027)"/></g></svg>';
    

    let progressBar = document.createElement('div');
    progressBar.classList.add('playlist-track__progress-bar');


    const volumeContainer = document.createElement('div');
    const volumeSlider = document.createElement('input');

    volumeSlider.setAttribute('type', 'range');
    volumeSlider.setAttribute('min', '1');
    volumeSlider.setAttribute('max', '100');
    volumeSlider.setAttribute('value', '60');

    volumeContainer.classList.add('playlist-track__volume-container');
    volumeSlider.classList.add('playlist-track__volume-slider');

   


    // Attach to DOM 
    userChosenPlaylist.appendChild(playlistTrackDiv);
    playlistTrackDiv.appendChild(img);
    img.appendChild(trackLink);
    playlistTrackDiv.appendChild(songInfoContainer);
    songInfoContainer.appendChild(headings.h1);
    songInfoContainer.appendChild(headings.h2);
    playlistTrackDiv.appendChild(playerControl);
    playlistTrackDiv.appendChild(options);
    playlistTrackDiv.appendChild(progressBar);
    
    volumeContainer.appendChild(volumeSlider);


    playerControl.insertAdjacentElement('afterbegin', progressBar);
    playerControl.insertAdjacentElement('beforeend', volumeContainer);

    // Append Options Dropdown to Playlist Track
    options.appendChild(optionsDropdown);
    optionsDropdown.appendChild(goToLink);
    optionsDropdown.appendChild(moveToAPlaylist);
    optionsDropdown.appendChild(deleteTrack);

    // Preview Songs... set up in tracks div
    // let audioTrack = new Audio(trackLink.href);  
      
    img.addEventListener('click', (evt) => {

        
        
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
        });


        evt.target.firstElementChild.paused ? evt.target.firstElementChild.play() : evt.target.firstElementChild.pause(); 
    });

    playerControl.addEventListener('click', (evt) => {

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
        });
    });

    trackLink.addEventListener("playing", (evt) => {
        let song = evt.target;

        let duration = song.duration;
        let parentOfEvent = song.parentElement.parentElement;
        let progressBar = getChildElementByClass(parentOfEvent, 'playlist-track__media').firstElementChild;
        
        advance(duration, trackLink, progressBar);
        

        console.log(trackLink.volume);
        

      });



}

function songVolume(element){
    let sliderValue = element.value;
    let songParentElement = element.parentElement.parentElement.parentElement.firstChild;
    let song = getChildElementByClass(songParentElement, 'playlist-track__link') || getChildElementByClass(songParentElement, 'track__link');

    sliderValue = sliderValue / 100;

    if(sliderValue < 0.4){
        console.log(element);
        console.dir(element)
        let volumeIcon = element.parentElement.firstElementChild;
        volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';
        // volumeIcon.className = 'fas fa-volume-down';
        console.log(volumeIcon);
        console.dir(volumeIcon)
    }
    if(sliderValue > 0.4){
        let volumeIcon = element.parentElement.firstElementChild;
        volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
    }

    

    song.volume = sliderValue;
    console.log(song.volume)
}

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

function refreshPlaylistBody(playlistName){
    let updateThisPlaylist;
    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
    
    trackWrapper.forEach( (wrapper) => {
        if(wrapper.parentElement.childNodes[0].textContent === playlistName){
            updateThisPlaylist = wrapper;
            
        }
    });

    // This is for dealing with the DOM's live list
    for (let i = updateThisPlaylist.children.length; i--; ) {
        updateThisPlaylist.children[i].remove();
    }
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

            refreshPlaylistBody(playlistNameValue);           

            movedPlaylist.items.forEach( (playlistSong) => {

                createPlaylistTrackBody(playlistSong, playlistNameValue);
            });
        });
    })
    .catch((err) => {
        console.log(err);
    });
    return spotifyData;
}


function removeElementFromDOM(element){
    element.parentNode.removeChild(element);
}

function moodSubmitCleanUp(){
    const tracksDiv = document.querySelector('.tracks');
    const genresFilterTab = document.querySelector('.genres-filter-tab__list');
    const moodFilterTab = document.querySelector('.mood-filter-genre');


    // Delete previous entries inside track div
    while (tracksDiv.firstChild) {
        tracksDiv.removeChild(tracksDiv.firstChild);
    }

    // Delete chosen genres under search bar
    while(moodFilterTab.firstChild){
        moodFilterTab.removeChild(moodFilterTab.firstChild);
    }

    // Delete chosen genres from genre
    while(genresFilterTab.firstChild){
        genresFilterTab.removeChild(genresFilterTab.firstChild);
    }
}

function cleanUpGenres(){
    let genresChosen = Array.from(document.querySelectorAll('.genres-toggle'));
    let storeGenres = [];
    const regForGenres = /&/g;
    const genresToggleEvent = document.querySelector('.genres-show');
    // let genreToggleEvent = getChildElementByClass(genresDiv, 'genres-show');

    if(genresToggleEvent){
        genresToggleEvent.classList.toggle('genres-show');
    }

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

    return storeGenres;

}

function buildURL(genres, maxVal, minVal, dataFeatures){
    console.log(genres, maxVal, minVal, dataFeatures);

    let url = `https://api.spotify.com/v1/recommendations?max_valence=${maxVal}&min_valence=${minVal}&limit=30`;

    if(dataFeatures[0].hasOwnProperty('minEnergy')){
        url += `&min_energy=${dataFeatures[0].minEnergy}`;
    }
    if(dataFeatures[0].hasOwnProperty('maxEnergy')){
        url += `&max_energy=${dataFeatures[0].maxEnergy}`;
    }

    function urlGenerate(){
        console.log(url);
        let newUrl = handleGenres(url, genres);
        console.log(newUrl);
        return newUrl;


    }

    return urlGenerate;
}


// Song Volume
window.addEventListener('mouseup', (evt) => {
    if(evt.target.classList.contains('playlist-track__volume-slider')){
        songVolume(evt.target);
    }
    if(evt.target.classList.contains('track__volume-slider')){
        songVolume(evt.target);
    }

});
window.addEventListener('input', (evt) => {
    if(evt.target.classList.contains('playlist-track__volume-slider')){
        songVolume(evt.target);
    }
    if(evt.target.classList.contains('track__volume-slider')){
        songVolume(evt.target);
    }
});



// Creating a new playlist 
createPlaylistSubmit.addEventListener('submit', (evt) => {

    evt.preventDefault();
    spotifyCreatePlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists`);
});

// Importing a new playlist
importPlaylistSubmit.addEventListener('submit', (evt) => {
    evt.preventDefault();

    let importPlaylistName = document.querySelector('.im-pl__name').value;
    let clearValue = document.querySelector('.im-pl__name');
    let flexibleName = importPlaylistName.toLowerCase();
    let importedPlaylistID;
    let importDiv = document.querySelector('.im-pl');
    let importError = document.querySelector('.im-pl__error');
    
    
    clearValue.value = '';
    

    if(importError){
        removeElementFromDOM(importError);
    }
    

    spotifyGrab(`https://api.spotify.com/v1/me/playlists`)
    .then((data) => {
        return data.json();
    })
    .then( (listOfUserPlaylists) => {
        
        // Cycle through to get user requested playlist ID 
        listOfUserPlaylists.items.forEach( (playlist) => {
            if(flexibleName == playlist.name.toLowerCase()){
                importedPlaylistID = playlist.id;
                importPlaylistName = playlist.name;
            }
        });

        let playlistExists = updateTotalPlaylists(importPlaylistName, importedPlaylistID);

        // Give message, sorry there's no playlist matching this name out of your playlists
        if(!importedPlaylistID) {
            
            createImportError(`Sorry there's no playlist matching this name "${importPlaylistName}" out of your Spotify playlists!`);
        
            return 1;
        }
        
        // A playlist with this name has already been imported
        if(playlistExists){ 
            createImportError(`A playlist with the name "${importPlaylistName}" has already been imported.`);
            return 1;
        }

        
        playlistPlate(importPlaylistName, importedPlaylistID);
        closeModal();
        


        // Fetch for that specfic ID
        // Fetch that URL get the returned tracks and put into creat Playlist tracks
        spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${importedPlaylistID}/tracks`)
        .then((response) => {
            return response.json();
        })
        .then((importedTracks) => {
            importedTracks.items.forEach( (playlistSong) => {

                createPlaylistTrackBody(playlistSong, importPlaylistName);
            });

        });

    })
    .catch((err) => {
        console.log(err);
    });
   
});

// Move song from one playlist to another
document.querySelector('.tran-modal__mv-song').addEventListener('submit', (evt) => {
        // Grab selection chosen from a User
        evt.preventDefault();
        let mvsSelect = document.querySelector('.mvs-select');
        let moveSongForm = document.querySelector('.tran-modal__mv-song');
        let songAttachment = document.querySelector('.song-action');
        let tranModal = document.querySelector('.tran-modal');

        // Why remove this?
        removeElementFromDOM(mvsSelect);
        removeElementFromDOM(songAttachment);
        
        let moveSong = [deleteThis];
        let moveToThisPlaylist;
        playlistNameValue = mvsSelect.value;

        moveToThisPlaylist = getPlaylistID(playlistNameValue);
        
        tranModal.classList.toggle('tran-modal__show-modal');

        // tranModal.classList.toggle('tran-modal__show');
        moveSongForm.classList.toggle('tran-modal__show-form');
           
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

                    refreshPlaylistBody(currentChosenPlaylist.name);
                    
                    updatedPlaylist.items.forEach( (playlistSong) => {
                        createPlaylistTrackBody(playlistSong);
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
document.querySelector('.tran-modal__del-song').addEventListener('submit', (evt) => {
        evt.preventDefault();

        let delSongForm = document.querySelector('.tran-modal__del-song');

        let songAttachment = document.querySelector('.song-action');
        let tranModal = document.querySelector('.tran-modal');


        removeElementFromDOM(songAttachment);
        // deleteModal.classList.toggle("delete-modal__show-modal");

        delSongForm.classList.toggle('tran-modal__show-form');
        tranModal.classList.toggle('tran-modal__show-modal');
        
            
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

                    refreshPlaylistBody(currentChosenPlaylist.name);
    
                    updatedPlaylist.items.forEach( (playlistSong) => {
        
                        createPlaylistTrackBody(playlistSong);
                    });
                });
                
            })
            .catch((err) => {
                console.log(err);
            });
});

// Remove a playlist
document.querySelector('.tran-modal__rm-playlist').addEventListener('submit', (evt) => {
    evt.preventDefault();
    evt.stopPropagation();


    let tranModal = document.querySelector('.tran-modal');
    let removePlaylistForm = document.querySelector('.tran-modal__rm-playlist');
    
    let currentHiddenPlaylists = document.querySelectorAll('.playlist-list__playlist--hide');

    // Show other playlist when one chosen is deleted
    currentHiddenPlaylists.forEach((hiddenElement) => {
        hiddenElement.classList.remove('playlist-list__playlist--hide');
    });

    
    tranModal.classList.toggle('tran-modal__show-modal');
    removePlaylistForm.classList.toggle('tran-modal__show-form');

    grandparentOfTarget.childNodes.forEach((child) => {
        if(child === deleteMe){
            grandparentOfTarget.removeChild(child);
        }
    });
    // Takes in a playlist name to fetch the ID and index position to remove from Total Playlists array
    
    removeFromTotalPlaylists(deleteMe.childNodes[0].textContent);
    
});

// Show music
document.querySelector('.mood__form').addEventListener('submit', (evt) => {
    evt.preventDefault();

    const userMood = document.querySelector('.mood__val');
    const userMoodValue = userMood.value.toLowerCase();
    const playlistFooter = document.querySelector('.playlist');

    let storeGenres = cleanUpGenres(); 
    moodSubmitCleanUp();

    playlistFooter.classList.add('playlist__show');
    
    userMood.value = '';

    // Fetch emotion json from my database
    fetch(`/${userMoodValue}`)
    .then( (data) => {
        return data.json();
    })
    .then( (audioFeatures) => {
        const maxVal = Math.max(...audioFeatures[0].idNumbers);
        const minVal = Math.min(...audioFeatures[0].idNumbers);

        closureURL = buildURL(storeGenres, maxVal, minVal, audioFeatures);
        let newURL = closureURL();

        spotifyProcessTracks(newURL);   
    })
    .catch( (err) => {
        console.log(err);
    });

});


// Modal's Close Button
document.querySelectorAll('.close-modal-btn').forEach((btn) => {
    btn.addEventListener('click', closeModal);
});
document.querySelectorAll('.btn--decline').forEach((btn) => {
    

    btn.addEventListener('click', closeModal);
});

// When the user clicks anywhere outside of the modal, close it
window.addEventListener('click', (evt) => {
    let optionsDropDown = document.querySelector('.show__options');
    let options = document.querySelector('.options');
    let moveSongForm = document.querySelector('.tran-modal__mv-song');
    let tranModal = document.querySelector('.tran-modal');
    let crImPlaylistModal = document.querySelector('.modal');
    
    
    // Creating/Importing a playlist modal view
    if (evt.target == crImPlaylistModal){
        crImPlaylistModal.classList.toggle('modal--show');
    }

    // Move playlist modal view
    if (evt.target === tranModal){
        closeModal();
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
    // evt.stopPropagation();
    const playlist = document.querySelector('.playlist');
    const createBtn = document.querySelector('.playlist-create');
    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
    const importTab = document.getElementById('im-pl-tab');
    const createTab = document.getElementById('cr-pl-tab');
    let tranModal = document.querySelector('.tran-modal');
    let crImPlaylistModal = document.querySelector('.modal');
    
    
            

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
        crImPlaylistModal.classList.toggle('modal--show');
    }

    if(evt.target.className === 'playlist-create'){
        createTab.checked = true;
        crImPlaylistModal.classList.toggle('modal--show');
    }

    let playlistID;
    let playlistName;

    // Playlist Name & ID
    if(evt.target.className === "playlist-list__playlist"){
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
        let removePlaylistSpan = document.querySelector('.rm-playlist');
        let removePlaylistForm = document.querySelector('.tran-modal__rm-playlist');

        tranModal.classList.toggle('tran-modal__show-modal');
        removePlaylistForm.classList.toggle('tran-modal__show-form');

        removePlaylistSpan.textContent = `"${evt.target.parentElement.childNodes[0].textContent}"?`;
        
        grandparentOfTarget = evt.target.parentElement.parentElement;
        deleteMe = evt.target.parentElement;
        
    }

    // Delete Song Modal
    if(evt.target.classList.contains("delete-modal-trigger")){
        evt.stopPropagation();

        // HTML Dom Attachment variables
        let deleteForm = document.querySelector('.tran-modal__del-song');
        let deleteFormHook = document.querySelector('.tran-modal__del-verify-head');

        // Dom traversing / set attributes
        let songActionBody = modalSongBodyAttachment(evt.target);
        
        tranModal.classList.toggle('tran-modal__show-modal');
        deleteForm.classList.toggle('tran-modal__show-form');

        deleteFormHook.parentNode.insertBefore(songActionBody.songAction, deleteFormHook.nextElementSibling);  
    }
        
    // Move Song from one playlist to another
    if(evt.target.classList.contains("move-song")){
        evt.stopPropagation();

        let moveSongForm = document.querySelector('.tran-modal__mv-song');
        let playlistSelect = document.createElement('select');
        let playlistOptions = document.createElement('option');
        let hookForSelectElem = document.querySelector('.tran-modal__mv-verify-head');

        let songActionBody = modalSongBodyAttachment(evt.target);


        // Create options for select
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

        hookForSelectElem.parentNode.insertBefore(playlistSelect, hookForSelectElem.nextElementSibling);
        hookForSelectElem.parentNode.insertBefore(songActionBody.songAction, hookForSelectElem.nextElementSibling);
        
        tranModal.classList.toggle('tran-modal__show-modal');
        moveSongForm.classList.toggle('tran-modal__show-form');
    }

    // More options drop down
    if(evt.target.className === 'options'){
        optionsHelper = evt.target;
        
        evt.target.firstElementChild.classList.toggle('show__options');
    }

    // Show trackwrapper on click showing playlist tracks
    if(evt.target.classList.contains('playlist-list__playlist')){
        let playlistNames = document.querySelectorAll('.playlist-list__playlist');

        // evt.target.classList.toggle('active-playlist');

        playlistNames.forEach((playlist) =>{
            if(evt.target !== playlist){
                playlist.classList.toggle('playlist-list__playlist--hide');
            }
        });

        evt.target.firstElementChild.nextElementSibling.classList.toggle('track-wrapper--show');


        
        // if(trackWrapper.contains('track-wrapper--show')){
           evt.target.classList.toggle('playlist-list__playlist--show')
        // }
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
        
        if(chosenGenresLength > 4) {

            filterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            });
            searchFilterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            });

            evt.target.classList.remove("genres-toggle");
            
            let currentGenres = Array.from(document.querySelectorAll('.genres-toggle'));
        

        }
        else if(evt.target.classList.contains('genres-toggle')){
            filterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            });
            searchFilterTags.forEach((pickedGenre) => {
                if(evt.target.textContent === pickedGenre.textContent){
                    pickedGenre.remove();
                }
            });
            evt.target.classList.remove('genres-toggle');
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
        });

        evt.target.classList.remove('genres-filter-tab__tag');
        evt.target.remove();
        
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


// Get username.  *** Implement Error check if guest account ***
spotifyGrab("https://api.spotify.com/v1/me")
.then( (data) => {
    data.json()

    .then( (jsonData) => {
        let username = document.getElementById('username');
        jsonData.display_name ? username.textContent = jsonData.display_name : username.textContent = jsonData.id; 


        // Copy Spotify User Info
        for(let i in jsonData){
            userInfo[i] = jsonData[i];
        }
        
    });
})
.catch((err) => {
    console.log(err);
});


// Infinite Scroll
document.addEventListener('scroll', function() {
    let scrollPosition = window.pageYOffset;
    let windowSize = window.innerHeight;
    let bodyHeight = document.body.offsetHeight;
    
    if(scrollPosition + windowSize >= bodyHeight){

        let scrollURL = closureURL();
        spotifyProcessTracks(scrollURL); 
        
    }
});


// Song Duration Div Show
function advance(duration, element, targetedElement) {

  let progress = targetedElement;
  let increment = 10 / duration;
  let percent = Math.min(increment * element.currentTime * 10, 100);
  targetedElement.style.width = `${percent}%`;
  startTimer(duration, element, percent, targetedElement);

}


function startTimer(duration, element, percentage, targetedElement){ 
    let timer;
  if(percentage < 100) {
    timer = setTimeout(function (){
        advance(duration, element, targetedElement);
    }, 100);
  }
}



// document.querySelector('.tracks').addEventListener('click', (evt) => {
    
//     if(evt.target.classList.contains('track__progress-bar')){
        
//         let offset = evt.target.getClientRects()[0].left;
//         let clickedPosition = evt.clientX;

//         let trackWidth = evt.target.parentElement.parentElement.clientWidth;

//         let songTimePosition = clickedPosition - offset;

//         let songParent = evt.target.parentElement.parentElement.firstElementChild;
//         let song = getChildElementByClass(songParent, 'track__link');

//         song.currentTime = songTimePosition;

//         console.log(song.currentTime)

//         console.log(trackWidth)

//         console.log(clickedPosition - offset);
    
//     }
// });