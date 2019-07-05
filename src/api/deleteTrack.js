import axios from './index';

const deleteTrack = (playlistID, track) =>
  axios.delete(`playlists/${playlistID}/tracks`, {
    data: JSON.stringify({
      tracks: [
        {
          uri: track
        }
      ]
    })
  });

export default deleteTrack;
