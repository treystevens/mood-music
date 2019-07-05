import axios from './index';
import { id } from '../user';

// https://api.spotify.com/v1/playlists/{playlist_id}/tracks

const getPlaylistTracks = playlistID =>
  axios.get(`users/${id}/playlists/${playlistID}/tracks`);

export default getPlaylistTracks;

// !!! TODO - Below is deprecated
// users/${id}/playlists/${playlistID}/tracks
