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
let deleteModal = document.querySelector('.delete-modal');
let moveSongModal = document.querySelector('.mvs-modal');
let songQueue = [];
const playlistBar = document.querySelector('.playlist-bar');
const playlistList = document.querySelector('.playlist-list');
const playlistExtended = document.querySelector('.playlist-extended');
var currentChosenPlaylist = {};
let playlistNameTab = Array.from(document.getElementsByClassName('playlist-list__name'));
let deleteModalForm = document.querySelector('.delete-modal__content');
let deleteThis;
let playlistNameValue;
let optionsHelper;
let spanClose = document.querySelectorAll('.close-btn');
// let successBtn = document.querySelector('.success-btn');

moveSongModal.addEventListener('submit', (evt) => {
        // Grab selection chosen from a User
        evt.preventDefault();
        let mvsSelect = document.querySelector('.mvs-select')
        mvsSelect.parentNode.removeChild(mvsSelect);
        
        let moveSong = [deleteThis];
        let moveToThisPlaylist;
        playlistNameValue = mvsSelect.value;

        for(let k in totalPlaylists){
            if(playlistNameValue === totalPlaylists[k].name) moveToThisPlaylist = totalPlaylists[k].id;
        }

        // // console.log(mvsSelect.dataset)
        // console.dir(mvsSelect)
        console.log(playlistNameValue)
        console.log(moveToThisPlaylist)

        
        console.log(deleteThis)
        
        moveSongModal.classList.toggle("mvs-modal__show-modal");
        
            
        deleteSong(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, deleteThis)
            .then((response) => {
                console.log(response)
                response.json();
            })
            .then((data) => {
                // Get back updated playlist *** code from add songs to playlist section ** place into function 
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`)
                .then((playlist) => {
                    console.log(`got the playlist`)
                    return playlist.json();
                })
                
                .then( (updatedPlaylist) => {
                    
                    let playlistNameTab = Array.from(document.querySelectorAll('.playlist-list__name'));
                    let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
                    let counter = 0;
                    let updateThisPlaylist;
                    let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
                    
                    console.dir(trackWrapper);
        
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
        
                    
                })
                .then((afterUpdate) => {
                    // console.log(`reached to addsong to palylist`)

                    console.log(moveSong)

                    movePlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${moveToThisPlaylist}/tracks`, moveSong, moveToThisPlaylist)
        
                });
                
            })
            .catch((err) => {
                console.log(err);
            });

})

// Delete song from Playlist
deleteModalForm.addEventListener('submit', (evt) => {
    
        evt.preventDefault();
        deleteModal.classList.toggle("delete-modal__show-modal");
        
            
        deleteSong(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`, deleteThis)
            .then((response) => {
                console.log(response)
                response.json();
            })
            .then((data) => {
                // Get back updated playlist *** code from add songs to playlist section ** place into function 
                spotifyGrab(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${currentChosenPlaylist.id}/tracks`)
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
                     console.log(updatedPlaylist)
                    updatedPlaylist.items.forEach( (playlistSong) => {
        
                        createPlaylistBody(playlistSong);
                    });
        
                    
                });
                
            })
            .catch((err) => {
                console.log(err);
            });
});

function deleteSong(url, track){
    // get song

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

addPlaylist.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        modal.style.display = "block";
    });
});


spanClose.forEach((btn) => {
    btn.addEventListener('click', (evt) => {
        deleteModal.classList.remove("delete-modal__show-modal");
        modal.style.display = "none";

        let mvsModal = document.querySelector('.mvs-modal__content');
        let selectMvs = document.querySelector('.mvs-select');
        moveSongModal.classList.remove("mvs-modal__show-modal");
    })
})


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

    if(evt.target !== document.querySelector('.genre')){
        document.querySelector('.genres-filter__toggle').classList.remove('genres-show')
    }

    // More Options on playlist Tracks
    if (evt.target !== optionsHelper) {
    // if (evt.target !== optionsHelper) {
        console.log(`here`)

        let dropdowns = document.getElementsByClassName("options-dropdown");

        for (let i = 0; i < dropdowns.length; i++) {
        //   let openDropdown = dropdowns[i];
        //   if (openDropdown.classList.contains("show__options")) {
            console.log('jansdkajnd')
            dropdowns[i].classList.remove("show__options");
        //   }
        }
      }

      // GENRES DROPDWON
    //   let genreTog = document.querySelector('.genres-show');
//     genreTog.classList.remove('.genres-show');
});



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
        evt.stopPropagation();
        let chosenGenres = document.querySelectorAll('.genres-toggle').length;

        if(chosenGenres > 4) {
            console.log(`Can't add another genre, sorry`);
            evt.target.classList.remove("genres-toggle");
        }
        else{
            evt.target.classList.toggle("genres-toggle");
            console.log(chosenGenres);
        }
    });
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
})

// Drop Genre dropdown
genreDrop.addEventListener('click', (evt) => {
    evt.stopPropagation();
    document.querySelector('.genres-filter__toggle').classList.toggle('genres-show');
});


// Remove Genres clicked from user
clearGenres.addEventListener('click', () => {
    let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
    chosenGenres.forEach( (genre) => {
        genre.classList.remove('genres-toggle');
    });

});

// Generate random genres in the URL if no genre(s) specified
function handleGenres(url, storedGenres) {
    let buildGenres;
    let chosenGenres = Array.from(document.querySelectorAll('.genres-toggle'));
    let reg = /&/g;

    // Use user chosen genres
    if(storedGenres.length > 0){
        storedGenres.forEach( (genre) => {
            if(buildGenres === undefined) {
                buildGenres = `&seed_genres=${genre}`;
                console.log(buildGenres);
            }
            else {
                buildGenres += `,${genre}`;
                console.log(buildGenres);
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

function processSongURI(uri){
    var reg = /\w+:/g; 
    let trackURI = uri.replace(reg, '');

    return trackURI;
    
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
            console.log(data);
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

        updateTotalPlaylistCount(createdPlaylist.name, createdPlaylist.id);
        playlistPlate(createdPlaylist.name, createdPlaylist.id);

        if(songQueue.length > 0){
            // If there are songs in the queue add them to the newly created playlist
            addSongToPlaylist(`https://api.spotify.com/v1/users/${userInfo.id}/playlists/${createdPlaylist.id}/tracks`, songQueue, createdPlaylist.id);
            
            }
                
    })
    .catch((err) => {
        console.log(err);
    });

    // return spotifyData;
}

function playlistPlate(name, id){
    const playlistDiv = document.createElement('div');
    const trackWrapper = document.createElement('div');
    const removePlaylist = document.createElement('div');
    let moreOptionsDropSelection = document.getElementsByClassName('options-dropdown__link');

    playlistDiv.textContent = name;
    removePlaylist.textContent = 'x'

    playlistDiv.classList.add('playlist-list__name');
    trackWrapper.classList.add('track-wrapper');
    removePlaylist.classList.add('remove-playlist');

    playlistDiv.setAttribute('data-playlist-id', id);

    currentChosenPlaylist.name = name;
    currentChosenPlaylist.id = id;


    // Click event
    playlistDiv.addEventListener('click', (evt) => {
        // evt.stopPropagation();
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

        if(evt.target.className === 'remove-playlist'){
            let modal = document.createElement('div');
            let modalContent = document.createElement('div');

            //
            let removePlaylistContent = document.createElement('form');
            let removeHeading = document.createElement('h1');
            let successBtn = document.createElement('button');
            let exitBtn = document.createElement('button');

            removeHeading.textContent = `Are you sure you'd like to remove playlist "${evt.target.parentElement.childNodes[0].textContent}"?`;
            successBtn.textContent = `Yes`;
            exitBtn.textContent = `No`;
            


            console.dir(evt.target)
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
            })

          removePlaylistContent.addEventListener('submit', (evt) => {
              console.log('did I make it?');
            evt.preventDefault();
            modal.style.display = 'none';
            deleteMe.removeChild(deleteMe.firstChild);
          })
        
          
          console.dir(deleteMe)
          document.body.appendChild(modal);
          modal.appendChild(modalContent);
          modalContent.appendChild(removePlaylistContent);
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
            let playlistOptions = document.createElement('option')

            let deleteAppend = document.querySelector('.mvs-delete-modal-btn')

            for(let i = 0; i < totalPlaylists.length; i++){
                console.log(totalPlaylists[i]);
                console.log(currentChosenPlaylist)
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
            
            moveModal.classList.toggle("mvs-modal__show-modal");
        }

        // More options drop down
        if(evt.target.className === "options"){
            optionsHelper = evt.target;
            evt.target.firstChild.classList.toggle("show__options")
        }

    
        // Set up drop down to hide playlist
        
        console.log(currentChosenPlaylist);
    });

    playlistList.appendChild(playlistDiv);
    playlistDiv.appendChild(trackWrapper);
    playlistDiv.appendChild(removePlaylist) // Unsure may break code
    
    
}


function movePlaylist(url, songLinks, playlistID){

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
            console.log(playlist)
            return playlist.json();
        })
        .then((movedPlaylist) =>{
            // console.log(movedPlaylist)
            let playlistNameTab = Array.from(document.querySelectorAll('.playlist-list__name'));
            let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
            let updateThisPlaylist;
            let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
            
            // console.dir(trackWrapper);

            trackWrapper.forEach( (wrapper) => {
                if(wrapper.parentElement.childNodes[0].textContent === playlistNameValue){
                    updateThisPlaylist = wrapper;
                    // console.log(playlist, `this is the list item`);
                }
            });

            console.log(updateThisPlaylist)
            console.dir(updateThisPlaylist)

            // This is for dealing with the DOM's live list
            for (let i = updateThisPlaylist.children.length; i--; ) {
                updateThisPlaylist.children[i].remove();
            }

            movedPlaylist.items.forEach( (playlistSong) => {

                createPlaylistBody(playlistSong, playlistNameValue);
            });
        })
    })
    .catch((err) => {
        console.log(err);
    });
    console.log(spotifyData)
    return spotifyData;
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
            let playlistNameTab = Array.from(document.querySelectorAll('.playlist-list__name'));
            let playlistTrack = Array.from(document.getElementsByClassName('playlist-track'));
            let counter = 0;
            let updateThisPlaylist;
            let trackWrapper = Array.from(document.getElementsByClassName('track-wrapper'));
            
            console.dir(trackWrapper);

            trackWrapper.forEach( (wrapper) => {
                if(wrapper.parentElement.childNodes[0].textContent === currentChosenPlaylist.name){
                    updateThisPlaylist = wrapper;
                    // console.log(playlist, `this is the list item`);
                }
            });

            console.dir(updateThisPlaylist)

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

// Need to see what can be refactored from this and createSongBody function
function createPlaylistBody(playlistObj, importedPlaylistName){
    const playlistTrackDiv = document.createElement('div');
    const img = document.createElement('img');
    const trackLink = document.createElement('a');
    const headings = {
        h1: document.createElement('h1'),
        h2: document.createElement('h2'),
        h4: document.createElement('h4')
    };
    const playBtn = document.createElement('button');
    // Dropdown for playlist
    const moreOptions = document.createElement('div');
    const moreOptionsDropdown = document.createElement('div');
    const goToLink = document.createElement('a');
    const moveToAPlaylist = document.createElement('a');
    const deleteTrack = document.createElement('a');

    

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
    headings.h1.classList.add('playlist-track__name');
    headings.h2.classList.add('playlist-track__arist');
    headings.h4.classList.add('playlist-track__album');
    playBtn.classList.add('playlist-track__play');

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
    playlistTrackDiv.setAttribute('data-spotify-track', newPlaylistTrack.uri);

    img.src = newPlaylistTrack.album_img.url;
    headings.h1.textContent = newPlaylistTrack.song_title;
    headings.h2.textContent = newPlaylistTrack.artist;
    headings.h4.textContent = newPlaylistTrack.album_name;

    
    goToLink.textContent = "Go to song link";
    moveToAPlaylist.textContent = "Move song to another playlist";
    deleteTrack.textContent = "Delete track";


    // Attach to DOM 
    userChosenPlaylist.appendChild(playlistTrackDiv);
    playlistTrackDiv.appendChild(trackLink);
    trackLink.appendChild(img);
    playlistTrackDiv.appendChild(headings.h1);
    playlistTrackDiv.appendChild(headings.h4);
    playlistTrackDiv.appendChild(headings.h2);
    playlistTrackDiv.appendChild(moreOptions);
    // playlistTrackDiv.appendChild(playlistAddBtn);

    moreOptions.appendChild(moreOptionsDropdown);
    moreOptionsDropdown.appendChild(goToLink);
    moreOptionsDropdown.appendChild(moveToAPlaylist);
    moreOptionsDropdown.appendChild(deleteTrack);

    // Preview Songs... set up in tracks div
    let audioTrack = new Audio(trackLink.href);    
    trackLink.addEventListener('click', (evt) => {
        evt.preventDefault();
        
        audioTrack.paused ? audioTrack.play() : audioTrack.pause(); 
    });

}

// For songs that are in the body
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
    let genresChosen = Array.from(document.querySelectorAll('.genres-toggle'));
    let storeGenres = [];
    let reg = /&/g;

    

    genresChosen.forEach((genre) => {
        let genreName = genre.textContent.toLowerCase();
        if(genreName === 'r & b' || genreName === 'rock & roll'){
            genreName = genre.textContent.replace(reg, 'n').toLowerCase();
            
        } 
        if(genreName === 'drum & bass'){
            genreName = genre.textContent.replace(reg, 'and').toLowerCase();
        }

        genre.classList.remove('genres-toggle');
        console.log(genreName)
        genreName = genreName.replace(/ /g, '-');
        storeGenres.push(genreName);
    });
    // storeGenres = [...genresChosen];
    console.log(storeGenres)
    
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

        let newUrl = handleGenres(url, storeGenres); 
        console.log(newUrl)
        spotifyProcessTracks(newUrl);   
    
        // Infinite Scroll
        document.addEventListener('scroll', function() {
            let scrollPosition = window.pageYOffset;
            let windowSize = window.innerHeight;
            let bodyHeight = document.body.offsetHeight;
            
            if(scrollPosition + windowSize >= bodyHeight){
                let scrollUrl = handleGenres(url, storeGenres);
                console.log(scrollUrl)
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

                updateTotalPlaylistCount(importPlaylistName, importedPlaylistID);
                playlistPlate(importPlaylistName, importedPlaylistID);


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

