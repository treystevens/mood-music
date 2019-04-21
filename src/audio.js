import { myModule, getChildElementByClass, addSongToPlaylist } from './index';

/**
 *
 * Creates an element with optional configuration.
 * @param {String} tag
 * @param {Object} config - Takes a valid Element attribute property.
 *                          Value must be a string or an array
 *
 */
function createElement(tag, config) {
  const elem = document.createElement(tag);

  if (config === undefined) return elem;

  for (let property in config) {
    if (property === 'textContent') elem.textContent = config[property];
    if (typeof config[property] === 'object')
      elem.setAttribute(property, config[property].join(' '));
    else {
      elem.setAttribute(property, config[property]);
    }
  }
  return elem;
}

/**
 *
 * Create a song card struture for song information.
 * @param {Object} trackObj - Returned song information from Spotify.
 */
function createSongBody(trackObj) {
  const songCard = createElement('div', { class: 'track' });
  const songImg = createElement('img', {
    alt: `Artwork for the song "${trackObj.song_title}", from ${
      trackObj.artist
    }`,
    class: 'track__img',
    src: trackObj.album_img.url
  });
  const songName = createElement('h1', {
    class: 'track__name',
    textContent: trackObj.song_title
  });
  const songArtist = createElement('h2', {
    class: 'track__artist',
    textContent: trackObj.artist
  });
  const playlistAddBtn = createElement('div', {
    class: ['track__pl-add', 'cr-pl__btn'],
    'data-track-uri': trackObj.uri
  });
  const songCardsContainer = document.querySelector('.tracks');
  const progressBar = createElement('div', { class: 'track__progress-bar' });
  const songAudio = createElement('audio', {
    class: 'track__link',
    src: trackObj.preview_url
  });
  const playerControl = createElement('div', { class: 'track__media' });

  playerControl.innerHTML =
    '<svg class="media-controls" xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><path class="media-controls__pause inactive-dash-pause" stroke="#3F3E3E" stroke-linecap="round" stroke-linejoin="round" stroke-width="5" d="M48,25 L48,71.8053097 C45.1666667,73.6017699 42.3333333,74.5 39.5,74.5 C36.6666667,74.5 33.8333333,73.6017699 31,71.8053097"/><path class="media-controls__play inactive-dash" stroke-linecap="round" stroke="#3F3E3E" stroke-width="5" d="M72.0763886,68.3352333 L62.1474475,68.3352333 L27.2723011,68.3352333 C25.0631621,68.3352333 23.2723011,66.5443723 23.2723011,64.3352333 C23.2723011,63.4859068 23.542644,62.6586256 24.0441798,61.9731933 L46.4462236,31.3570669 C47.7507422,29.5742247 50.2535427,29.1864669 52.0363849,30.4909855 C52.3678287,30.7335054 52.6599463,31.025623 52.9024662,31.3570669 L75.3045099,61.9731933 C76.6090286,63.7560355 76.2212708,66.258836 74.4384286,67.5633546 C73.7529963,68.0648904 72.9257152,68.3352333 72.0763886,68.3352333 L68.7548694,68.3352333" transform="rotate(90 49.674 49.027)"/></g></svg>';

  // Initialize Volume
  const volumeIcon = createElement('i', { class: ['fas', 'fa-volume-up'] });
  const volumeContainer = createElement('div', {
    class: 'track__volume-container'
  });
  const volumeSlider = createElement('input', {
    type: 'range',
    min: '1',
    max: '100',
    value: '60',
    class: 'track__volume-slider'
  });
  volumeContainer.appendChild(volumeIcon);
  volumeContainer.appendChild(volumeSlider);

  // Attach to DOM
  songCardsContainer.appendChild(songCard);
  songCard.appendChild(songImg);
  songImg.appendChild(songAudio);
  songCard.appendChild(progressBar);
  songCard.appendChild(playerControl);

  songCard.appendChild(volumeContainer);
  songCard.appendChild(songName);
  songCard.appendChild(songArtist);
  songCard.appendChild(playlistAddBtn);

  playlistAddBtn.innerHTML =
    '<svg class="track__svg-add-btn" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 100 100"><g fill="none" fill-rule="evenodd"><circle cx="50" cy="50" r="50" fill="#469B6E"/><g fill="#FFF" transform="translate(25.926 25.926)"><rect width="11.111" height="48.148" x="18.519" rx="5" transform="rotate(-90 24.074 24.074)"/><rect width="11.111" height="48.148" x="18.519" rx="5"/></g></g></svg>';

  // Preview Songs change to add an   event
  let audioTrack = new Audio(songAudio.href);
  songAudio.addEventListener('click', evt => {
    evt.preventDefault();

    audioTrack.paused ? audioTrack.play() : audioTrack.pause();
  });

  // Reset the count for Scrolling Fetch
  myModule.scrollCount = 0;

  songCardImgListener(songImg, playerControl, songAudio);
  playerControlListener(playerControl, songAudio);

  // Add tracks to playlist
  playlistAddBtnListener(playlistAddBtn);

  audioPlayingListener(songAudio, progressBar);
}

/**
 * Playing event listener added to audio element
 * Calls advance to have song progress bar to match song duration.
 * @param {HTMLElement} elem
 */
function audioPlayingListener(elem, progressBar) {
  elem.addEventListener('playing', evt => {
    const duration = evt.target.duration;
    advance(duration, elem, progressBar);
  });
}

/**
 *
 * Handles play and pause audio SVG state
 * when user clicks on song control.
 * @param {HTMLElement} elem
 */
function playerControlListener(elem, audioElem) {
  elem.addEventListener('click', () => {
    animatePlaySVG(elem);
    togglePlay(audioElem);
  });
}

/**
 *
 * Handles play and pause audio SVG state when user clicks on song image.
 * @param {HTMLElement} elem
 */
function songCardImgListener(elem, refElem, audioElem) {
  elem.addEventListener('click', () => {
    animatePlaySVG(refElem);
    togglePlay(audioElem);
  });
}

/**
 *
 * Adds a chosen song to a playlist.
 * - If there are no playlists the song gets added to a queue.
 * - If not, there is a total of one playlist the song is added to the available playlist/
 * - Lastly, song is added to the user's chosen playlist.
 *
 * @param {HTMLElement} elem
 */
function playlistAddBtnListener(elem) {
  elem.addEventListener('click', evt => {
    const addedSong = evt.target.getAttribute('data-track-uri');
    const crImPlaylistModal = document.querySelector('.modal');
    const createTab = document.getElementById('cr-pl-tab');
    createTab.checked = true;

    if (myModule.totalPlaylists.length === 0) {
      const queuedSong = addedSong;
      myModule.songQueue.push(queuedSong);

      crImPlaylistModal.classList.toggle('modal--show');
    } else if (myModule.totalPlaylists.length === 1) {
      myModule.currentChosenPlaylist.name = myModule.totalPlaylists[0].name;
      myModule.currentChosenPlaylist.id = myModule.totalPlaylists[0].id;

      addSongToPlaylist(
        `https://api.spotify.com/v1/users/${myModule.userInfo.id}/playlists/${
          myModule.currentChosenPlaylist.id
        }/tracks`,
        [addedSong],
        myModule.currentChosenPlaylist.id
      );
    } else {
      addSongToPlaylist(
        `https://api.spotify.com/v1/users/${myModule.userInfo.id}/playlists/${
          myModule.currentChosenPlaylist.id
        }/tracks`,
        [addedSong],
        myModule.currentChosenPlaylist.id
      );
    }
  });
}

/**
 *
 * Toggles animation on the play/pause svg
 * @param {HTMLElement} refElem
 *
 */
function animatePlaySVG(refElem) {
  const playSVG = refElem.firstChild;
  const gPath = playSVG.firstChild;
  const playPath = gPath.lastChild;
  const pausePath = gPath.firstElementChild;

  playPath.classList.remove('inactive-dash');
  pausePath.classList.remove('inactive-dash-pause');

  playPath.classList.toggle('play-ani');
  pausePath.classList.toggle('pause-ani');
  playSVG.classList.toggle('media-controls-toggle');
}

/**
 *
 * @param {HTMLMediaElement} elem
 */
function togglePlay(elem) {
  elem.paused ? elem.play() : elem.pause();
}

// Song Duration Div Show
export function advance(duration, element, targetedElement) {
  const increment = 10 / duration;
  const percent = Math.min(increment * element.currentTime * 10, 100);
  targetedElement.style.width = `${percent}%`;
  startTimer(duration, element, percent, targetedElement);
}

function startTimer(duration, element, percentage, targetedElement) {
  if (percentage < 100) {
    setTimeout(function() {
      advance(duration, element, targetedElement);
    }, 100);
  }
  if (percentage == 100) {
    // refactor
    if (targetedElement.classList.contains('track__progress-bar')) {
      let parentOfTarget = targetedElement.parentNode;
      let trackMedia = getChildElementByClass(parentOfTarget, 'track__media');
      let mediaControls = getChildElementByClass(trackMedia, 'media-controls');
      let gPath = getChildElementByClass(mediaControls, 'media-controls')
        .firstChild;
      let playPath = gPath.lastChild;
      let pausePath = gPath.firstElementChild;

      mediaControls.classList.toggle('media-controls-toggle');
      playPath.classList.toggle('play-ani');
      pausePath.classList.toggle('pause-ani');
    }
    if (targetedElement.classList.contains('playlist-track__progress-bar')) {
      let grandparentTarget = targetedElement.parentNode.parentNode;
      let trackMedia = getChildElementByClass(
        grandparentTarget,
        'playlist-track__media'
      );
      let mediaControls = getChildElementByClass(trackMedia, 'media-controls');
      let gPath = getChildElementByClass(mediaControls, 'media-controls')
        .firstChild;
      let playPath = gPath.lastChild;
      let pausePath = gPath.firstElementChild;

      playPath.classList.toggle('play-ani');
      pausePath.classList.toggle('pause-ani');
    }
  }
}

export default createSongBody;
