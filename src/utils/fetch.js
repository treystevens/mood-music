import {
  myModule,
  refreshPlaylistBody,
  createPlaylistTrackBody,
  confirmAction
} from '../index';

export function spotifyGrab(url, accessToken) {
  const init = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + accessToken
    }
  };

  let spotifyData = fetch(`https://api.spotify.com/v1/${url}`, init);
  return spotifyData;
}

export default spotifyGrab;

export function addSongToPlaylist(url, songLinks, playlistID) {
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

  // Add song(s) to playlist
  fetch(url, init)
    .then(response => {
      while (myModule.songQueue.length > 0) {
        myModule.songQueue.pop();
      }
      return response.json();
    })
    .then(() => {
      // Get back updated playlist
      spotifyGrab(
        `users/${myModule.userInfo.id}/playlists/${playlistID}/tracks`,
        myModule.accessToken
      )
        .then(playlist => {
          return playlist.json();
        })
        .then(updatedPlaylist => {
          refreshPlaylistBody(myModule.currentChosenPlaylist.name);

          updatedPlaylist.items.forEach(playlistSong => {
            createPlaylistTrackBody(playlistSong);
          });
          confirmAction(myModule.currentChosenPlaylist.name, 'song');
        });
    })
    .catch(err => {
      console.log(err);
    });
}
