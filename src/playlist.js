import {
  myModule,
  createPlaylistTrackBody,
  closeModal,
  confirmAction
} from './index';
import getCurrentUsersPlaylists from './api/getCurrentUsersPlaylists';
import getPlaylistTracks from './api/getPlaylistTracks';

function findPlaylist(name) {
  for (let playlist in myModule.totalPlaylists) {
    if (myModule.totalPlaylists[playlist].name === name) {
      return myModule.totalPlaylists.indexOf(myModule.totalPlaylists[playlist]);
    }
  }
  return -1;
}

// Playlist Template
function createPlaylistView(name, id) {
  const playlistList = document.querySelector('.playlist-list');
  const playlistDiv = document.createElement('div');
  const trackWrapper = document.createElement('div');
  const playlistName = document.createElement('h4');
  const removePlaylist = document.createElement('span');
  const currentShownPlaylist = document.querySelector(
    '.playlist-list__playlist--show'
  );

  const caretDrop = document.createElement('span');
  caretDrop.innerHTML = '<i class="fas fa-chevron-right no-animation"></i>';

  // playlistDiv.textContent = name;
  playlistName.textContent = name;
  // removePlaylist.textContent = 'x';

  playlistDiv.classList.add('playlist-list__playlist');
  playlistName.classList.add('playlist-list__name');
  caretDrop.classList.add('playlist-list__caret-container');
  trackWrapper.classList.add('track-wrapper');
  removePlaylist.classList.add('remove-playlist');

  if (currentShownPlaylist) {
    playlistDiv.classList.add('playlist-list__playlist--hide');
  }

  playlistDiv.setAttribute('data-playlist-id', id);

  myModule.currentChosenPlaylist.name = name;
  myModule.currentChosenPlaylist.id = id;

  playlistList.appendChild(playlistDiv);
  playlistDiv.appendChild(playlistName);
  playlistName.appendChild(caretDrop);
  playlistDiv.appendChild(trackWrapper);
  playlistDiv.appendChild(removePlaylist);

  playlistColorSequence();
}

async function importPlaylist(evt) {
  evt.preventDefault();

  const importPlaylistElem = document.querySelector('.im-pl__name');
  const importError = document.querySelector('.im-pl__error');
  const tabContentContainer = document.querySelector('.tab-content-container');
  let playlistName = importPlaylistElem.value;

  tabContentContainer.classList.remove('tab-content--error');
  importPlaylistElem.value = '';

  if (importError) {
    importError.remove();
  }

  try {
    const playlistsResponse = await getCurrentUsersPlaylists();
    const playlists = playlistsResponse.data;
    const playlistNameLowerCase = playlistName.toLowerCase();
    let playlistID;

    // Cycle through to get user requested playlist ID
    playlists.items.forEach(playlist => {
      if (playlistNameLowerCase == playlist.name.toLowerCase()) {
        playlistID = playlist.id;
        playlistName = playlist.name;
      }
    });

    if (!playlistID) {
      createImportError(
        `Sorry, there's no playlist matching this name "${playlistName}" out of your Spotify playlists!`
      );
      return;
    }

    if (findPlaylist(playlistName) !== -1) {
      createImportError(
        `A playlist with the name "${playlistName}" has already been imported.`
      );
      return;
    }

    createPlaylistView(playlistName, playlistID);
    closeModal();

    // Fetch for that specfic ID
    // Fetch that URL get the returned tracks and put into create Playlist tracks
    const tracksResponse = await getPlaylistTracks(playlistID);
    const tracks = tracksResponse.data;
    tracks.items.forEach(track => {
      createPlaylistTrackBody(track, playlistName);
    });
    confirmAction(playlistName, 'import');
  } catch (err) {
    console.log(err);
  }
}

// Takes a String as an argument for Import Modal Error Message
function createImportError(errorMessage) {
  let errorBody = document.createElement('span');
  let contentBox = document.querySelector('.tab-content-container');
  let inputHook = document.querySelector('.im-pl__name');

  contentBox.classList.add('tab-content--error');
  errorBody.classList.add('im-pl__error');

  errorBody.textContent = errorMessage;

  inputHook.parentNode.insertBefore(errorBody, inputHook.nextElementSibling);
}

// Random Color for Playlist
function playlistColorSequence() {
  let playlists = document.getElementsByClassName('playlist-list__playlist');
  let colors = ['#E8A5A5', '#783E3E', '#BF4949', '#D15273'];

  for (let i = 0; i < playlists.length; i++) {
    playlists[i].style.backgroundColor = colors[i % colors.length];
  }
}

export { importPlaylist, createPlaylistView, findPlaylist };
