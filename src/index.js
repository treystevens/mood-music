import {
  createSongBody,
  advance,
  validCard,
  getUpdatedPlaylist
} from './audio';
import { importPlaylist, createPlaylistView, findPlaylist } from './playlist';
import { id, setID } from './user';
import getAccount from './api/getAccount';
import createPlaylist from './api/createPlaylist';
import getTracks from './api/getTracks';
import getPlaylistTracks from './api/getPlaylistTracks';
import addTrackToPlaylist from './api/addTrackToPlaylist';
import deleteTrack from './api/deleteTrack';
import { buildURL, browseURL } from './shared/browse';
import isMobile from './utils/isMobile';
import axios from 'axios';

export let myModule = (function() {
  let module = {};

  module.closureURL = '';

  module.currentTracks = [];
  module.totalPlaylists = [];
  module.songQueue = [];
  module.currentChosenPlaylist = {};
  module.sortedChosenGenres = [];

  module.deleteThis = '';
  module.playlistNameValue = '';
  module.optionsHelper = '';

  module.deleteMe = '';
  module.grandparentOfTarget = '';

  module.initColor = handleBackgroundColor();
  module.scrollPositionTracker = [];

  module.isMobile = isMobile();

  module.initScroll = {
    happened: false,
    moment: ''
  };

  module.wasSubmitted = false;
  module.startTime = undefined;

  module.storeMoodValue = '';

  module.smoothingSupported = smoothingScrollSupportCheck();

  module.mobileIsScrolling = undefined;

  module.inRange = false;
  module.scrollCount = 0;

  return module;
})();

function smoothingScrollSupportCheck() {
  if ('scrollBehavior' in document.documentElement.style) {
    return true;
  } else {
    return false;
  }
}

let eventModule = (function() {
  let events = {};

  events.moveSongModal = document.querySelector('.tran-modal__mv-song');
  events.deleteSongModal = document.querySelector('.tran-modal__del-song');
  events.removePlaylistModal = document.querySelector(
    '.tran-modal__rm-playlist'
  );
  events.moodForm = document.querySelector('.mood__form');
  events.closeModalBtn = document.querySelectorAll('.close-modal-btn');
  events.declineModalBtn = document.querySelectorAll('.btn--decline');
  events.playlistFooter = document.querySelector('.playlist');
  events.genres = document.querySelector('.genres');
  events.genresFilterSearch = document.querySelector('.genres-filter__search');
  events.createPlaylistSubmit = document.querySelector('.cr-pl__submit');
  events.importPlaylistSubmit = document.querySelector('.im-pl__submit');
  events.moodDiv = document.querySelector('.mood');
  events.logoContainer = document.querySelector('.logo-container');

  return events;
})();

// Initalize App on Startup
(function init() {
  isMobile();
  initEventListeners();
})();

// Close Modal
// !!! UTILS
export function closeModal() {
  let tranModal = document.querySelector('.tran-modal__show-modal');
  let removePlaylistForm = document.querySelector('.tran-modal__show-form');
  let selectMvs = document.querySelector('.mvs-select');
  let crImPlaylistModalDisplayed = document.querySelector('.modal--show');
  let songAttachment = document.querySelector('.song-action');
  let importErrorMessage = document.querySelector('.im-pl__error');
  let importErrorContainer = document.querySelector('.tab-content--error');
  let genreAnimation = document.querySelector('.genres-active-animation');
  let genres = document.querySelector('.genres-show');

  if (genreAnimation) {
    genreAnimation.classList.remove('genres-active-animation');
    genres.classList.remove('genres-show');
  }

  if (songAttachment) {
    removeElementFromDOM(songAttachment);
  }

  if (tranModal) {
    tranModal.classList.remove('tran-modal__show-modal');
    if (removePlaylistForm) {
      removePlaylistForm.classList.toggle('tran-modal__show-form');
    }
  }
  if (selectMvs) {
    removeElementFromDOM(selectMvs);
  }
  if (crImPlaylistModalDisplayed) {
    crImPlaylistModalDisplayed.classList.toggle('modal--show');
  }
  if (importErrorMessage) {
    importErrorContainer.classList.remove('tab-content--error');
    removeElementFromDOM(importErrorMessage);
  }
}

// Songs Added to Modal Action Confirmation
function modalSongBodyAttachment(element) {
  let ancestorElem = element.parentElement.parentElement.parentElement;
  let songImg = ancestorElem.childNodes[0].src;
  let songName =
    ancestorElem.childNodes[1].childNodes[1].childNodes[0].textContent;
  let artistName =
    ancestorElem.childNodes[1].childNodes[1].childNodes[1].textContent;
  myModule.deleteThis = ancestorElem.getAttribute('data-spotify-track');

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

// Make Song URI into URI format
function processSongURI(uri) {
  var reg = /\w+:/g;
  let trackURI = uri.replace(reg, '');

  return trackURI;
}

// Fetch to Spotify API...
function spotifyProcessTracks(tracks) {
  tracks.forEach(track => {
    // Check if song is already in the DOM
    if (myModule.currentTracks.length > 0) {
      for (let i = 0; i < myModule.currentTracks.length; i++) {
        if (track.album.name === myModule.currentTracks[i].album_name) return;
      }
    }

    if (track.preview_url && track.album.images[1] && track.uri) {
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
      myModule.currentTracks.push(newTrack);
    }
  });
}

// Retrieve Playlist ID from Total Playlists
function getPlaylistID(playlistName) {
  let playlistID;
  for (let k in myModule.totalPlaylists) {
    if (playlistName === myModule.totalPlaylists[k].name) {
      playlistID = myModule.totalPlaylists[k].id;
    }
  }
  return playlistID;
}

// Remove Playlist from Total Playlist
function removeFromTotalPlaylists(name) {
  let playlistID = getPlaylistID(name);
  let index = playlistAlreadyExistCheck(playlistID);
  myModule.totalPlaylists.splice(index, 1);
  updatePlaylistCount();
}

// Playlist Exists in Total Playlist
// !!! UTIL playlist util
function playlistAlreadyExistCheck(playlistID) {
  for (let property in myModule.totalPlaylists) {
    if (myModule.totalPlaylists[property].id === playlistID) {
      return myModule.totalPlaylists.indexOf(myModule.totalPlaylists[property]);
    }
  }
}

// Push to Total Playlists // Change index to exists??
function updateTotalPlaylists(name, id) {
  if (!id) {
    return;
  }
  let exists;
  let playlist = {
    name: name,
    id: id
  };

  // let index = playlistAlreadyExistCheck(id);
  let index = findPlaylist(name);

  if (index === -1) {
    myModule.totalPlaylists.push(playlist);
    updatePlaylistCount();
    exists = false;
    return exists;
  } else {
    exists = true;
    return exists;
  }
}

// Update Playlist Footer Count
export function updatePlaylistCount() {
  const playlistAmount = document.querySelector('.playlist-amount');
  playlistAmount.textContent = myModule.totalPlaylists.length;
}

export function getChildElementByClass(element, className) {
  // Check if element already contains class
  if (element.classList.contains(className)) {
    return element;
  } else {
    let elementChildren = element.childNodes;

    for (let i = 0; i < elementChildren.length; i++) {
      if (elementChildren[i].classList.contains(className)) {
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

export function confirmAction(playlistName, source) {
  let confirmationContainer = document.createElement('div');
  let confirmationInfo = document.createElement('h1');

  confirmationContainer.innerHTML = `<svg class="confirm-action-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52"><circle class="confirm-action-checkmark__circle" cx="26" cy="26" r="25" fill="none"/><path class="confirm-actioncheckmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/></svg>`;

  confirmationContainer.classList.add('confirm-action');
  confirmationContainer.classList.add('confirm-action--fade');

  // tranModalContent.classList.add('confirm-song--fade');
  confirmationInfo.classList.add('confirm-action__info');

  if (source === 'song') {
    confirmationInfo.textContent = `Added to "${playlistName}"`;
  }

  if (source === 'create') {
    confirmationInfo.textContent = `Created "${playlistName}"`;
  }

  if (source === 'import') {
    confirmationInfo.textContent = `Imported "${playlistName}"`;
  }

  document.body.appendChild(confirmationContainer);
  confirmationContainer.appendChild(confirmationInfo);

  setTimeout(function() {
    removeElementFromDOM(confirmationContainer);
  }, 2000);
}

function smoothingScroll(elementName) {
  window.scrollTo({
    top: 500,
    left: 0,
    behavior: 'smooth'
  });

  // Scroll certain amounts from current position
  window.scrollBy({
    top: 100, // could be negative value
    left: 0,
    behavior: 'smooth'
  });

  // Scroll to a certain element
  document.querySelector(elementName).scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

// Need to see what can be refactored from this and createSongBody function
export function createPlaylistTrackBody(playlistObj, importedPlaylistName) {
  const playlistTrackDiv = document.createElement('div');
  const playerControl = document.createElement('div');
  const img = document.createElement('img');
  const trackLink = document.createElement('audio');
  const headings = {
    h1: document.createElement('h1'),
    h2: document.createElement('h2'),
    h4: document.createElement('h4')
  };
  const playlistBodyContainer = document.createElement('div');

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

  let newPlaylistTrack = {
    album_name: playlistObj.track.album.name,
    album_img: playlistObj.track.album.images[1],
    artist: playlistObj.track.artists[0].name,
    preview_url: playlistObj.track.preview_url,
    song_title: playlistObj.track.name,
    trackID: playlistObj.track.id,
    uri: playlistObj.track.uri
  };

  if (newPlaylistTrack.preview_url !== null) {
    trackLink.src = newPlaylistTrack.preview_url;
  }

  playlistNameBar.forEach(childElement => {
    if (importedPlaylistName) {
      if (childElement.childNodes[0].textContent === importedPlaylistName) {
        userChosenPlaylist = getChildElementByClass(
          childElement,
          'track-wrapper'
        );
      }
    } else if (
      childElement.childNodes[0].textContent ===
      myModule.currentChosenPlaylist.name
    ) {
      userChosenPlaylist = getChildElementByClass(
        childElement,
        'track-wrapper'
      );
    }
  });

  // If user made requests to add songs without a playlist, this will point to the first playlist.
  if (userChosenPlaylist === undefined) {
    userChosenPlaylist = getChildElementByClass(
      playlistNameBar[0],
      'track-wrapper'
    );
  }

  // Setting up classes
  trackLink.classList.add('playlist-track__link');
  playlistTrackDiv.classList.add('playlist-track'); // 'playlist-track',
  img.classList.add('playlist-track__img');
  songInfoContainer.classList.add('playlist-track__song-info-container');
  headings.h1.classList.add('playlist-track__name');
  headings.h2.classList.add('playlist-track__arist');
  headings.h4.classList.add('playlist-track__album');
  playlistBodyContainer.classList.add('playlist-track__body-container');
  playBtn.classList.add('playlist-track__play-btn');

  // Dropdown Options Classes
  options.classList.add('options');
  optionsDropdown.classList.add('options-dropdown');
  goToLink.classList.add('options-dropdown__link', 'go-to-link');
  moveToAPlaylist.classList.add('options-dropdown__link', 'move-song');
  deleteTrack.classList.add('options-dropdown__link', 'delete-modal-trigger');

  // Setting DOM display
  let spotifyURL = 'https://open.spotify.com/track/';
  goToLink.setAttribute(
    'href',
    `${spotifyURL}${processSongURI(newPlaylistTrack.uri)}`
  );
  goToLink.setAttribute('target', '_blank');
  trackLink.setAttribute('href', newPlaylistTrack.preview_url);
  playBtn.setAttribute('href', newPlaylistTrack.preview_url);
  playlistTrackDiv.setAttribute('data-spotify-track', newPlaylistTrack.uri);

  img.src = newPlaylistTrack.album_img.url;

  headings.h1.textContent = newPlaylistTrack.song_title;
  headings.h2.textContent = newPlaylistTrack.artist;

  // Dropdown Options Text
  goToLink.textContent = 'Go to song link';
  moveToAPlaylist.textContent = 'Move song to another playlist';
  deleteTrack.textContent = 'Delete track';

  options.textContent = '\u2026';

  // Play-Pause SVG
  if (trackLink.src) {
    playerControl.classList.add('playlist-track__media');

    playerControl.innerHTML =
      '<svg class="media-controls" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><path class="media-controls__pause inactive-dash-pause" stroke="#3F3E3E" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M48,25 L48,71.8053097 C45.1666667,73.6017699 42.3333333,74.5 39.5,74.5 C36.6666667,74.5 33.8333333,73.6017699 31,71.8053097"/><path class="media-controls__play inactive-dash" stroke-linecap="round" stroke="#3F3E3E" stroke-width="5" d="M72.0763886,68.3352333 L62.1474475,68.3352333 L27.2723011,68.3352333 C25.0631621,68.3352333 23.2723011,66.5443723 23.2723011,64.3352333 C23.2723011,63.4859068 23.542644,62.6586256 24.0441798,61.9731933 L46.4462236,31.3570669 C47.7507422,29.5742247 50.2535427,29.1864669 52.0363849,30.4909855 C52.3678287,30.7335054 52.6599463,31.025623 52.9024662,31.3570669 L75.3045099,61.9731933 C76.6090286,63.7560355 76.2212708,66.258836 74.4384286,67.5633546 C73.7529963,68.0648904 72.9257152,68.3352333 72.0763886,68.3352333 L68.7548694,68.3352333" transform="rotate(90 49.674 49.027)"/></g></svg>';
  }

  let progressBar = document.createElement('div');
  progressBar.classList.add('playlist-track__progress-bar');

  progressBar.style.backgroundColor = document.body.style.backgroundColor;

  const volumeContainer = document.createElement('div');
  const volumeSlider = document.createElement('input');
  let volumeIcon = document.createElement('i');
  volumeIcon.classList.add('track__volume-icon');

  volumeIcon.className = 'fas fa-volume-up';

  volumeContainer.appendChild(volumeIcon);

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
  playlistTrackDiv.appendChild(playlistBodyContainer);
  playlistBodyContainer.appendChild(songInfoContainer);
  songInfoContainer.appendChild(headings.h1);
  songInfoContainer.appendChild(headings.h2);
  playlistTrackDiv.appendChild(playerControl);
  playlistTrackDiv.appendChild(options);
  // playlistTrackDiv.appendChild(progressBar);

  volumeContainer.appendChild(volumeSlider);

  playlistBodyContainer.insertAdjacentElement('afterbegin', progressBar);
  playlistBodyContainer.insertAdjacentElement('beforeend', volumeContainer);

  // Append Options Dropdown to Playlist Track
  options.appendChild(optionsDropdown);
  optionsDropdown.appendChild(goToLink);
  optionsDropdown.appendChild(moveToAPlaylist);
  optionsDropdown.appendChild(deleteTrack);

  // Preview Songs... set up in tracks div
  // let audioTrack = new Audio(trackLink.href);

  img.addEventListener('click', evt => {
    let playlistTrack = Array.from(evt.target.parentElement.children);

    playlistTrack.forEach(child => {
      if (child.className === 'playlist-track__media') {
        let playSVG = child.firstChild;
        let pausePath = playSVG.firstChild.firstChild;
        let playPath = playSVG.firstChild.lastChild;

        playPath.classList.remove('inactive-dash');
        pausePath.classList.remove('inactive-dash-pause');

        playPath.classList.toggle('play-ani');
        pausePath.classList.toggle('pause-ani');
      }
    });

    evt.target.firstElementChild.paused
      ? evt.target.firstElementChild.play()
      : evt.target.firstElementChild.pause();
  });

  playerControl.addEventListener('click', evt => {
    let gSVG = evt.target.firstChild;
    let pausePath = gSVG.firstChild;
    let playPath = gSVG.lastChild;

    playPath.classList.remove('inactive-dash');
    pausePath.classList.remove('inactive-dash-pause');

    playPath.classList.toggle('play-ani');
    pausePath.classList.toggle('pause-ani');

    let audioTrack = Array.from(
      evt.target.parentElement.parentElement.children
    );

    audioTrack.forEach(child => {
      if (child.className === 'playlist-track__img') {
        let songAudio = child.firstChild;
        songAudio.paused ? songAudio.play() : songAudio.pause();
      }
    });
  });

  trackLink.addEventListener('playing', evt => {
    let song = evt.target;

    let duration = song.duration;
    let parentOfEvent = song.parentElement.parentElement;
    let progressBarParent = getChildElementByClass(
      parentOfEvent,
      'playlist-track__body-container'
    );
    let progressBar = getChildElementByClass(
      progressBarParent,
      'playlist-track__progress-bar'
    );

    advance(duration, trackLink, progressBar);
  });
}

function songVolume(element) {
  let sliderValue = element.value;
  let songParentElement =
    element.parentElement.parentElement.parentElement.firstChild;
  let song =
    getChildElementByClass(songParentElement, 'playlist-track__link') ||
    getChildElementByClass(songParentElement, 'track__link');

  sliderValue = sliderValue / 100;

  // Change volume slider icon. Doesn't work in Safari.
  // if(sliderValue < 0.4){
  //     let volumeIcon = element.parentElement.firstElementChild;
  //     // volumeIcon.innerHTML = '<i class="fas fa-volume-down"></i>';

  // }
  // if(sliderValue > 0.4){
  //     let volumeIcon = element.parentElement.firstElementChild;
  //     // volumeIcon.innerHTML = '<i class="fas fa-volume-up"></i>';
  // }
  song.volume = sliderValue;
}

export function refreshPlaylistBody(playlistName) {
  let updateThisPlaylist;
  let trackWrapper = Array.from(
    document.getElementsByClassName('track-wrapper')
  );

  trackWrapper.forEach(wrapper => {
    if (wrapper.parentElement.childNodes[0].textContent === playlistName) {
      updateThisPlaylist = wrapper;
    }
  });

  // This is for dealing with the DOM's live list
  for (let i = updateThisPlaylist.children.length; i--; ) {
    updateThisPlaylist.children[i].remove();
  }
}

// Move a Song to Another Playlist -- *** REFACTOR**
function moveSongFromPlaylist(url, songLinks, playlistID) {
  let data = {
    uris: songLinks
  };
  const init = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + myModule.accessToken
    },
    body: JSON.stringify(data)
  };

  // Add song to playlist
  let spotifyData = fetch(url, init)
    .then(response => {
      return response.json();
    })
    .then(() => {
      // Get back updated playlist
      return getPlaylistTracks(playlistID);
    })
    .then(response => {
      const movedPlaylist = response.data;
      refreshPlaylistBody(myModule.playlistNameValue);

      movedPlaylist.items.forEach(playlistSong => {
        createPlaylistTrackBody(playlistSong, myModule.playlistNameValue);
      });
    })
    .catch(err => {
      console.log(err);
    });
  return spotifyData;
}

function removeElementFromDOM(element) {
  element.parentNode.removeChild(element);
}

function moodSubmitCleanUp() {
  const tracksDiv = document.querySelector('.tracks');
  const genresFilterTab = document.querySelector('.genres-filter-tab__list');
  const moodFilterTab = document.querySelector('.genres-search-filter-genre');
  const noResult = document.querySelector('.no-result');

  // Delete previous entries inside track div
  while (tracksDiv.firstChild) {
    tracksDiv.removeChild(tracksDiv.firstChild);
  }

  // Delete chosen genres under search bar
  while (moodFilterTab.firstChild) {
    moodFilterTab.removeChild(moodFilterTab.firstChild);
  }

  // Delete chosen genres from genre
  while (genresFilterTab.firstChild) {
    genresFilterTab.removeChild(genresFilterTab.firstChild);
  }

  if (noResult) {
    removeElementFromDOM(noResult);
  }
}

// Get username
getAccount()
  .then(response => {
    if (response.status === 401) {
      window.location.href = '/login';
      return;
    }

    const { display_name, id } = response.data;
    const usernameElem = document.querySelector('.username');
    display_name
      ? (usernameElem.textContent = display_name)
      : (usernameElem.textContent = id);

    setID(id);
  })
  .catch(() => {
    const content = document.querySelector('.content-wrapper');
    const loginLink = document.createElement('a');

    while (content.firstChild) {
      content.removeChild(content.firstChild);
    }
    loginLink.setAttribute('href', '/login.html');
    loginLink.textContent = `login here!`;
    document.body.appendChild(loginLink);
  });

// Polyfill if Smooth Behavior is not supported
function moveScrollPosition(timestamp, dist, duration) {
  let timeStamp = timestamp || new Date().getTime();
  let runtime = timeStamp - myModule.startTime;
  let progress = runtime / duration;

  progress = Math.min(progress, 1);
  window.scrollTo(0, (dist * progress).toFixed(2));

  if (runtime < duration) {
    requestAnimationFrame(function(timestamp) {
      moveScrollPosition(timestamp, dist, duration);
    });
  }
}

// If mood does not match or no tracks are returned from search
function noTrackResult() {
  let noResult = document.createElement('h1');
  noResult.textContent = `Sorry can't find any songs matching the mood "${
    myModule.storeMoodValue
  }"!`;
  noResult.classList.add('no-result');

  document.body.appendChild(noResult);
}

function handleBackgroundColor() {
  let count = 0;
  let colors = [
    '#FFB63F',
    '#FEC4CF',
    '#6C95CC',
    '#CC3B6C',
    '#89BCE5',
    '#FED4CA',
    '#DEDCED'
  ];

  return function changeBackgroundColor() {
    count++;
    if (count === colors.length) {
      count = 0;
    }
    return colors[count];
  };
}

function initEventListeners() {
  // Infinite Scroll
  document.addEventListener('scroll', function() {
    const tracksDiv = document.querySelector('.tracks');
    let scrollPosition = window.pageYOffset;
    let windowSize = window.innerHeight;
    let bodyHeight = document.body.offsetHeight;
    // const wrapWrap = document.querySelector('.wrap');

    // Mobile scrolling features
    if (myModule.isMobile) {
      let webLogo = document.querySelector('.logo');
      clearTimeout(myModule.mobileIsScrolling);

      myModule.mobileIsScrolling = setTimeout(function() {
        webLogo.classList.remove('logo--size');
      }, 200);

      if (scrollPosition > tracksDiv.getBoundingClientRect().top) {
        webLogo.classList.add('logo--size');
      }
      if (tracksDiv.getBoundingClientRect().top > 0) {
        webLogo.classList.remove('logo--size');
      }
    }

    for (let i = 0; i < myModule.scrollPositionTracker.length; i++) {
      if (
        myModule.scrollPositionTracker[i].scrollPosition >
          scrollPosition - 500 &&
        myModule.scrollPositionTracker[i].scrollPosition < scrollPosition + 500
      ) {
        let allMedia = Array.from(
          document.querySelectorAll('.track__progress-bar')
        );
        let playlistMedia = Array.from(
          document.querySelectorAll('.playlist-track__progress-bar')
        );

        allMedia.forEach(progressBar => {
          progressBar.style.backgroundColor =
            myModule.scrollPositionTracker[i].color;
        });

        playlistMedia.forEach(progressBar => {
          progressBar.style.backgroundColor =
            myModule.scrollPositionTracker[i].color;
        });

        document.body.style.backgroundColor =
          myModule.scrollPositionTracker[i].color;
      }
      if (scrollPosition < myModule.initScroll.moment) {
        let allMedia = Array.from(
          document.querySelectorAll('.track__progress-bar')
        );
        let playlistMedia = Array.from(
          document.querySelectorAll('.playlist-track__progress-bar')
        );
        allMedia.forEach(progressBar => {
          progressBar.style.backgroundColor = '#E47A67';
        });

        playlistMedia.forEach(progressBar => {
          progressBar.style.backgroundColor = '#E47A67';
        });

        document.body.style.backgroundColor = '#E47A67';
      }
    }

    // Only fetch new songs if a mood was submitted
    if (tracksDiv.childNodes.length > 0) {
      if (scrollPosition + windowSize >= bodyHeight - bodyHeight * 0.05) {
        myModule.scrollCount++;

        if (myModule.scrollCount === 1) {
          myModule.wasSubmitted = false;

          getTracks(browseURL).then(response => {
            const { tracks } = response.data;
            spotifyProcessTracks(tracks);

            if (myModule.initScroll.happened === false) {
              myModule.initScroll.happened = true;
              myModule.initScroll.moment = scrollPosition;
            }

            let allMedia = Array.from(
              document.querySelectorAll('.track__progress-bar')
            );
            let currentColor = myModule.initColor();

            let referenceObj = {
              color: currentColor,
              scrollPosition: scrollPosition
            };

            myModule.scrollPositionTracker.push(referenceObj);

            allMedia.forEach(progressBar => {
              progressBar.style.backgroundColor = currentColor;
            });

            document.body.style.backgroundColor = currentColor;
          });
        }
      }
    }
  });

  // Genres Section
  eventModule.genres.addEventListener('click', evt => {
    evt.stopPropagation();

    // Genres Dropdown
    if (evt.target.classList.contains('genres-drop__header')) {
      let rightCaret = document.querySelector('.fa-caret-right');

      let genresDiv = document.querySelector('.genres');

      let genreFilterToggle = document.querySelector('.genres-filter__toggle');
      let genreModal = genreFilterToggle.parentElement.parentElement;
      let genreModalContent = genreFilterToggle.parentElement;

      // Set up Mobile Genre Header
      if (myModule.isMobile == true) {
        let genreModalCloseBtn = document.querySelector('.close-modal-btn--g');

        // Remove Modal Btn on first instance
        if (genreModalCloseBtn) {
          removeElementFromDOM(genreModalCloseBtn);
        }

        genresDiv.classList.toggle('genres-mb');
        genreModalContent.classList.toggle('tran-modal--genre-mb');
        document
          .querySelector('.genres-drop__header')
          .classList.toggle('genres-drop__header-mb');

        // setTimeout(function(){
        //     let genresFilterTabHeight = document.querySelector('.genres-filter-tab').offsetHeight
        //     let genresSearchHeadHeight = document.querySelector('.genres-filter__search-head').offsetHeight;
        //     let genresDropHeight = document.querySelector('.genres-search-filter').offsetHeight;
        //     let genresList = document.querySelector('.genres-list');

        //     genresList.style.height = `calc(100vh - (${genresFilterTabHeight}px + ${genresSearchHeadHeight}px + ${genresDropHeight}px + 20px))`;

        // }, 10);
      }

      // Genre Caret Animation
      rightCaret.classList.remove('no-animation');
      rightCaret.classList.toggle('genres-active-animation');
      genreFilterToggle.classList.toggle('genres-show');
      genreModal.classList.toggle('tran-modal__show-modal');
    }

    // Clear All Genres Button
    if (evt.target.className === 'genres-filter-tab__clear') {
      let filterList = document.querySelector('.genres-filter-tab__list');
      let chosenGenres = Array.from(
        document.querySelectorAll('.genres-toggle')
      );
      let moodDiv = document.querySelector('.genres-search-filter-genre');
      chosenGenres.forEach(genre => {
        genre.classList.remove('genres-toggle');
      });

      while (filterList.firstChild) {
        filterList.removeChild(filterList.firstChild);
      }
      while (moodDiv.firstChild) {
        moodDiv.removeChild(moodDiv.firstChild);
      }
    }

    if (evt.target.classList.contains('genres-list__item')) {
      let chosenGenresLength = document.querySelectorAll('.genres-toggle')
        .length;
      let filterList = document.querySelector('.genres-filter-tab__list');

      let filterTags = document.querySelectorAll('.genres-filter-tab__tag');
      let searchFilterTags = document.querySelectorAll(
        '.genres-search-filter-genre__tag'
      );

      if (chosenGenresLength > 4) {
        // Remove from DOM
        filterTags.forEach(pickedGenre => {
          if (evt.target.textContent === pickedGenre.textContent) {
            pickedGenre.remove();
          }
        });
        searchFilterTags.forEach(pickedGenre => {
          if (evt.target.textContent === pickedGenre.textContent) {
            pickedGenre.remove();
          }
        });

        evt.target.classList.remove('genres-toggle');
      } else if (evt.target.classList.contains('genres-toggle')) {
        // Remove from DOM
        filterTags.forEach(pickedGenre => {
          if (evt.target.textContent === pickedGenre.textContent) {
            pickedGenre.remove();
          }
        });
        searchFilterTags.forEach(pickedGenre => {
          if (evt.target.textContent === pickedGenre.textContent) {
            pickedGenre.remove();
          }
        });
        evt.target.classList.remove('genres-toggle');
      } else {
        evt.target.classList.toggle('genres-toggle');
        let moodDiv = document.querySelector('.genres-search-filter-genre');

        myModule.sortedChosenGenres.push(evt.target.textContent);

        let genreTabListItem = document.createElement('li');
        let underSearchGenreItem = document.createElement('span');
        let closeIcon = document.createElement('i');
        let searchCloseIcon = document.createElement('i');

        underSearchGenreItem.textContent = evt.target.textContent;
        genreTabListItem.textContent = evt.target.textContent;
        underSearchGenreItem.classList.add('genres-search-filter-genre__tag');
        genreTabListItem.classList.add('genres-filter-tab__tag');
        closeIcon.className = 'fas fa-times genres-filter-tab__x';
        searchCloseIcon.className =
          'fas fa-times genres-search-filter-genre__x';

        filterList.appendChild(genreTabListItem);
        genreTabListItem.appendChild(closeIcon);
        underSearchGenreItem.appendChild(searchCloseIcon);

        // Set up Mobile Genre Header

        if (myModule.isMobile !== true) {
          moodDiv.appendChild(underSearchGenreItem);
        }
      }
    }

    // Genre Tags
    if (evt.target.className === 'genres-filter-tab__tag') {
      let chosenGenres = Array.from(
        document.querySelectorAll('.genres-toggle')
      );
      let searchFilterTags = document.querySelectorAll(
        '.genres-search-filter-genre__tag'
      );

      chosenGenres.forEach(genre => {
        if (evt.target.textContent === genre.textContent) {
          genre.classList.remove('genres-toggle');
          // genre.remove();
        }
      });

      searchFilterTags.forEach(pickedGenre => {
        if (evt.target.textContent === pickedGenre.textContent) {
          pickedGenre.remove();
        }
      });

      evt.target.classList.remove('genres-filter-tab__tag');
      evt.target.remove();
    }
    if (evt.target.className === 'genres-search-filter-genre__tag') {
      let chosenGenres = Array.from(
        document.querySelectorAll('.genres-toggle')
      );
      let genreTabTags = document.querySelectorAll('.genres-filter-tab__tag');

      chosenGenres.forEach(genre => {
        if (evt.target.textContent === genre.textContent) {
          genre.classList.remove('genres-toggle');
          // genre.remove();
        }
      });

      genreTabTags.forEach(genre => {
        if (evt.target.textContent === genre.textContent) {
          genre.remove();
        }
      });

      evt.target.classList.remove('genres-search-filter-genre__tag');
      evt.target.remove();
    }
  });

  // Genre search filter
  eventModule.genresFilterSearch.addEventListener('keyup', () => {
    let input = document.getElementsByClassName('genres-list__item');
    let filter = document
      .querySelector('.genres-filter__search')
      .value.toUpperCase();

    // Loop through all list items, and hide those who don't match the search query
    for (let i = 0; i < input.length; i++) {
      let currentElem = input[i];
      if (currentElem.textContent.toUpperCase().indexOf(filter) > -1) {
        currentElem.style.display = '';
      } else {
        currentElem.style.display = 'none';
      }
    }
  });

  eventModule.logoContainer.addEventListener('click', () => {
    if (myModule.smoothingSupported) {
      smoothingScroll('.mood');
    } else {
      requestAnimationFrame(function(timestamp) {
        myModule.startTime = timestamp || new Date().getTime();
        moveScrollPosition(timestamp, 0, 500);
      });
    }
  });

  /******* Modal Window & Mood Submit Events *******/

  // Creating a new playlist
  eventModule.createPlaylistSubmit.addEventListener('submit', evt => {
    evt.preventDefault();
    const data = {
      description: '' || document.querySelector('.cr-pl__description').value,
      public: true,
      name: document.querySelector('.cr-pl__name').value
    };

    createPlaylist(data)
      .then(response => {
        const createdPlaylist = response.data;
        const crPlName = document.querySelector('.cr-pl__name');
        const crPlDescription = document.querySelector('.cr-pl__description');

        updateTotalPlaylists(createdPlaylist.name, createdPlaylist.id);
        createPlaylistView(createdPlaylist.name, createdPlaylist.id);

        crPlName.value = '';
        crPlDescription.value = '';

        // If there are songs in the queue add them to the newly created playlist
        if (myModule.songQueue.length > 0) {
          const data = { uris: myModule.songQueue };
          addTrackToPlaylist(createdPlaylist.id, data)
            .then(() => {
              getUpdatedPlaylist(
                myModule.currentChosenPlaylist.name,
                createdPlaylist.id
              );
            })
            .catch(err => {
              console.log(err);
            });
        }

        confirmAction(createdPlaylist.name, 'create');
        closeModal();
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Importing a new playlist
  eventModule.importPlaylistSubmit.addEventListener('submit', importPlaylist);

  // Move song from one playlist to another
  eventModule.moveSongModal.addEventListener('submit', evt => {
    // Grab selection chosen from a User
    evt.preventDefault();
    let mvsSelect = document.querySelector('.mvs-select');
    let moveSongForm = document.querySelector('.tran-modal__mv-song');
    let songAttachment = document.querySelector('.song-action');
    let tranModal = document.querySelector('.tran-modal');

    // Why remove this?
    removeElementFromDOM(mvsSelect);
    removeElementFromDOM(songAttachment);

    let moveSong = [myModule.deleteThis];
    let moveToThisPlaylist;
    myModule.playlistNameValue = mvsSelect.value;

    moveToThisPlaylist = getPlaylistID(myModule.playlistNameValue);

    tranModal.classList.toggle('tran-modal__show-modal');
    moveSongForm.classList.toggle('tran-modal__show-form');

    deleteTrack(myModule.currentChosenPlaylist.id, myModule.deleteThis)
      .then(() => {
        // Get back updated playlist *** code from add songs to playlist section ** place into function
        return getPlaylistTracks(myModule.currentChosenPlaylist.id);
      })
      .then(response => {
        const updatedPlaylist = response.data;
        refreshPlaylistBody(myModule.currentChosenPlaylist.name);

        updatedPlaylist.items.forEach(playlistSong => {
          createPlaylistTrackBody(playlistSong);
        });
      })
      .then(() => {
        moveSongFromPlaylist(
          `https://api.spotify.com/v1/users/${id}/playlists/${moveToThisPlaylist}/tracks`,
          moveSong,
          moveToThisPlaylist
        );
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Delete song from Playlist
  eventModule.deleteSongModal.addEventListener('submit', evt => {
    evt.preventDefault();

    let delSongForm = document.querySelector('.tran-modal__del-song');
    let songAttachment = document.querySelector('.song-action');
    let tranModal = document.querySelector('.tran-modal');

    removeElementFromDOM(songAttachment);

    delSongForm.classList.toggle('tran-modal__show-form');
    tranModal.classList.toggle('tran-modal__show-modal');

    deleteTrack(myModule.currentChosenPlaylist.id, myModule.deleteThis)
      .then(() => {
        // Get back updated playlist *** code from add songs to playlist section ** place into function
        return getPlaylistTracks(myModule.currentChosenPlaylist.id);
      })
      .then(response => {
        const updatedPlaylist = response.data;
        refreshPlaylistBody(myModule.currentChosenPlaylist.name);

        updatedPlaylist.items.forEach(playlistSong => {
          createPlaylistTrackBody(playlistSong);
        });
      })
      .catch(err => {
        console.log(err);
      });
  });

  // Remove a playlist
  eventModule.removePlaylistModal.addEventListener('submit', evt => {
    evt.preventDefault();
    evt.stopPropagation();

    let tranModal = document.querySelector('.tran-modal');
    let removePlaylistForm = document.querySelector('.tran-modal__rm-playlist');

    let currentHiddenPlaylists = document.querySelectorAll(
      '.playlist-list__playlist--hide'
    );

    // Show other playlist when one chosen is deleted
    currentHiddenPlaylists.forEach(hiddenElement => {
      hiddenElement.classList.remove('playlist-list__playlist--hide');
    });

    tranModal.classList.toggle('tran-modal__show-modal');
    removePlaylistForm.classList.toggle('tran-modal__show-form');

    myModule.grandparentOfTarget.childNodes.forEach(child => {
      if (child === myModule.deleteMe) {
        myModule.grandparentOfTarget.removeChild(child);
      }
    });
    // Takes in a playlist name to fetch the ID and index position to remove from Total Playlists array

    removeFromTotalPlaylists(myModule.deleteMe.childNodes[0].textContent);
  });

  // Show music
  eventModule.moodForm.addEventListener('submit', evt => {
    evt.preventDefault();

    const mood = document.querySelector('.mood__val').value;
    const playlistFooter = document.querySelector('.playlist');

    myModule.storeMoodValue = mood;
    myModule.currentTracks = [];
    myModule.wasSubmitted = true;

    moodSubmitCleanUp();

    axios
      .get(`/user/mood/${mood}`)
      .then(response => {
        const moodFeatures = response.data;
        const maxVal = Math.max(...moodFeatures[0].idNumbers);
        const minVal = Math.min(...moodFeatures[0].idNumbers);
        playlistFooter.classList.add('playlist__show');

        return getTracks(buildURL(maxVal, minVal, moodFeatures));
      })
      .then(response => {
        const { tracks } = response.data;
        if (tracks.length === 0) {
          noTrackResult();
          return;
        }
        spotifyProcessTracks(tracks);
      })
      .catch(() => {
        noTrackResult();
      });
  });

  // Modal's Close Button
  eventModule.closeModalBtn.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  eventModule.declineModalBtn.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  /******  Feature Events *******/

  // Expand playlist footer
  eventModule.playlistFooter.addEventListener('click', evt => {
    const playlist = document.querySelector('.playlist');
    const createBtn = document.querySelector('.playlist-create');

    const importTab = document.getElementById('im-pl-tab');
    const createTab = document.getElementById('cr-pl-tab');
    let tranModal = document.querySelector('.tran-modal');
    let crImPlaylistModal = document.querySelector('.modal');

    if (evt.target.className === 'playlist-bar') {
      playlist.classList.toggle('extended-playlist');

      if (myModule.isMobile) {
        let logoContainer = document.querySelector('.logo-container');
        logoContainer.classList.toggle('show__elem');
      }
    }

    if (playlist.classList.contains('extended-playlist')) {
      createBtn.textContent = 'Create New Playlist +';
    }

    if (!playlist.classList.contains('extended-playlist')) {
      createBtn.innerHTML = '<span class="playlist-create__sign">+</span>';
      // createBtn.textContent = '+';
    }

    if (evt.target.className === 'playlist-import') {
      importTab.checked = true;
      crImPlaylistModal.classList.toggle('modal--show');
    }

    if (evt.target.className === 'playlist-create') {
      createTab.checked = true;
      crImPlaylistModal.classList.toggle('modal--show');
    }
    if (evt.target.className === 'playlist-create__sign') {
      createTab.checked = true;
      crImPlaylistModal.classList.toggle('modal--show');
    }

    let playlistName;

    // Playlist Name & ID
    if (evt.target.classList.contains('playlist-list__playlist')) {
      let referenceTarget = evt.target.firstChild.childNodes[1];
      let svgContainer = getChildElementByClass(
        referenceTarget,
        'fa-chevron-right'
      );

      let playlistHidden = document.querySelectorAll(
        '.playlist-list__playlist--hide'
      );

      svgContainer.classList.remove('no-animation');
      svgContainer.classList.toggle('playlist-active-animation');

      playlistName = evt.target.childNodes[0].textContent || ''; // need to fix

      myModule.currentChosenPlaylist.name = playlistName;

      playlistHidden.forEach(playlist => {
        let playlistSVG = playlist.children[0].firstElementChild.firstChild;
        playlistSVG.classList.add('no-animation');
      });

      // let trackWrapper = getChildElementByClass(evt.target, 'track-wrapper');
      // let playlistTracks = Array.from(trackWrapper.children);

      // playlistTracks.forEach((track) =>{
      //     let trackMedia = getChildElementByClass(track, 'playlist-track__media');
      //     let playPath = trackMedia.firstElementChild.firstChild.lastChild;

      //     playPath.classList.add('inactive-dash');
      // })

      // if(!playlistShow){
      //     playlistAll.forEach((playlist) => {

      //     })
      // }

      // Playlist ID
      for (let k in myModule.totalPlaylists) {
        if (playlistName === myModule.totalPlaylists[k].name) {
          // currentChosenPlaylist.name = totalPlaylists[k].name;
          myModule.currentChosenPlaylist.id = myModule.totalPlaylists[k].id;
        }
      }
    }

    // Remove a playlist
    if (evt.target.className === 'remove-playlist') {
      let removePlaylistSpan = document.querySelector('.rm-playlist');
      let removePlaylistForm = document.querySelector(
        '.tran-modal__rm-playlist'
      );

      tranModal.classList.toggle('tran-modal__show-modal');
      removePlaylistForm.classList.toggle('tran-modal__show-form');

      removePlaylistSpan.textContent = `"${
        evt.target.parentElement.childNodes[0].textContent
      }"?`;

      myModule.grandparentOfTarget = evt.target.parentElement.parentElement;
      myModule.deleteMe = evt.target.parentElement;
    }

    // Delete Song Modal
    if (evt.target.classList.contains('delete-modal-trigger')) {
      evt.stopPropagation();

      // HTML Dom Attachment variables
      let deleteForm = document.querySelector('.tran-modal__del-song');
      let deleteFormHook = document.querySelector(
        '.tran-modal__del-verify-head'
      );

      // Dom traversing / set attributes
      let songActionBody = modalSongBodyAttachment(evt.target);

      tranModal.classList.toggle('tran-modal__show-modal');
      deleteForm.classList.toggle('tran-modal__show-form');

      deleteFormHook.parentNode.insertBefore(
        songActionBody.songAction,
        deleteFormHook.nextElementSibling
      );
    }

    // Move Song from one playlist to another
    if (evt.target.classList.contains('move-song')) {
      // evt.stopPropagation();

      let moveSongForm = document.querySelector('.tran-modal__mv-song');
      let playlistSelect = document.createElement('select');
      let playlistOptions = document.createElement('option');
      let hookForSelectElem = document.querySelector(
        '.tran-modal__mv-verify-head'
      );

      let songActionBody = modalSongBodyAttachment(evt.target);

      // Create options for select
      for (let i = 0; i < myModule.totalPlaylists.length; i++) {
        if (
          myModule.currentChosenPlaylist.name !==
          myModule.totalPlaylists[i].name
        ) {
          playlistOptions = document.createElement('option');
          playlistOptions.setAttribute(
            'value',
            myModule.totalPlaylists[i].name
          );
          playlistOptions.setAttribute(
            'data-playlistId',
            myModule.totalPlaylists[i].id
          );
          playlistOptions.textContent = myModule.totalPlaylists[i].name;

          playlistSelect.appendChild(playlistOptions);
        }
      }

      playlistSelect.classList.add('mvs-select');

      hookForSelectElem.parentNode.insertBefore(
        playlistSelect,
        hookForSelectElem.nextElementSibling
      );
      hookForSelectElem.parentNode.insertBefore(
        songActionBody.songAction,
        hookForSelectElem.nextElementSibling
      );

      tranModal.classList.toggle('tran-modal__show-modal');
      moveSongForm.classList.toggle('tran-modal__show-form');
    }

    // More options drop down
    if (evt.target.className === 'options') {
      let currentShownOptions = document.querySelector('.show__elem');
      if (currentShownOptions) {
        currentShownOptions.classList.toggle('show__elem');
      }
      myModule.optionsHelper = evt.target;
      evt.target.firstElementChild.classList.toggle('show__elem');
    }

    // Show trackwrapper on click showing playlist tracks
    if (evt.target.classList.contains('playlist-list__playlist')) {
      let playlistNames = document.querySelectorAll('.playlist-list__playlist');

      // evt.target.classList.toggle('active-playlist');

      playlistNames.forEach(playlist => {
        if (evt.target !== playlist) {
          playlist.classList.toggle('playlist-list__playlist--hide');
        }
      });

      evt.target.firstElementChild.nextElementSibling.classList.toggle(
        'track-wrapper--show'
      );
      evt.target.classList.toggle('playlist-list__playlist--show');
    }

    // Show trackwrapper on click showing playlist tracks
    // if(evt.target.classList.contains('playlist-list__name')){
    //     let playlistNames = document.querySelectorAll('.playlist-list__playlist');

    //     // evt.target.classList.toggle('active-playlist');

    //     playlistNames.forEach((playlist) =>{
    //         if(evt.target.parentNode !== playlist){
    //             playlist.classList.toggle('playlist-list__playlist--hide');
    //         }
    //     });

    //     evt.target.parentNode.firstElementChild.nextElementSibling.classList.toggle('track-wrapper--show');
    //     evt.target.parentNode.classList.toggle('playlist-list__playlist--show');
    // }
  });

  // Refactor with "genres search "
  document
    .querySelector('.genres-filter__search')
    .addEventListener('input', evt => {
      let currentValue = evt.target.value;

      if (currentValue === '') {
        let input = document.getElementsByClassName('genres-list__item');
        let filter = document
          .querySelector('.genres-filter__search')
          .value.toUpperCase();

        // Loop through all list items, and hide those who don't match the search query
        for (let i = 0; i < input.length; i++) {
          let currentElem = input[i];
          if (currentElem.textContent.toUpperCase().indexOf(filter) > -1) {
            currentElem.style.display = '';
          } else {
            currentElem.style.display = 'none';
          }
        }
      }
    });

  document
    .querySelector('.tran-modal--genre')
    .addEventListener('click', evt => {
      // evt.stopPropagation()
      if (evt.target === document.querySelector('.tran-modal--genre')) {
        closeModal();
      }
    });

  /******* Window Events *******/

  // Song Volume
  window.addEventListener('mouseup', evt => {
    if (evt.target.classList.contains('playlist-track__volume-slider')) {
      songVolume(evt.target);
    }
    if (evt.target.classList.contains('track__volume-slider')) {
      songVolume(evt.target);
    }
  });
  window.addEventListener('input', evt => {
    if (evt.target.classList.contains('playlist-track__volume-slider')) {
      songVolume(evt.target);
    }
    if (evt.target.classList.contains('track__volume-slider')) {
      songVolume(evt.target);
    }
  });

  // When the user clicks anywhere outside of the modal, close it
  window.addEventListener('click', evt => {
    let tranModal = document.querySelector('.tran-modal');
    let crImPlaylistModal = document.querySelector('.modal');
    let genres = document.querySelector('.genres-show');
    let genreModal = document.querySelector('.tran-modal--genre');

    validCard(evt.target);

    // Creating/Importing a playlist modal view
    if (evt.target == crImPlaylistModal) {
      let tabContentContainer = document.querySelector(
        '.tab-content-container'
      );
      let errorMess = document.querySelector('.im-pl__error');

      crImPlaylistModal.classList.toggle('modal--show');
      tabContentContainer.classList.remove('tab-content--error');

      if (errorMess) {
        removeElementFromDOM(errorMess);
      }
    }

    // Move playlist modal view
    if (evt.target === tranModal) {
      closeModal();
    }

    if (evt.target === genreModal) {
      closeModal();
    }
    if (evt.target.classList.contains('tran-modal--genre')) {
      closeModal();
    }

    // More Options on playlist Tracks
    if (evt.target !== myModule.optionsHelper) {
      let dropdowns = document.getElementsByClassName('options-dropdown');

      for (let i = 0; i < dropdowns.length; i++) {
        dropdowns[i].classList.remove('show__elem');
      }
    }
    if (evt.target !== genres) {
      let genreAnimation = document.querySelector('.genres-active-animation');

      if (genreAnimation) {
        genreAnimation.classList.remove('genres-active-animation');
        genres.classList.remove('genres-show');
      }
    }
  });
}
