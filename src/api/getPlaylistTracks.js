import axios from './index';

const getPlaylistTracks = playlistID =>
  axios.get(`playlists/${playlistID}/tracks`);

export default getPlaylistTracks;
