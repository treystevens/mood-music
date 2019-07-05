import axios from './index';
import { id } from '../user';

const addTrackToPlaylist = (playlistID, data) =>
  axios.post(`users/${id}/playlists/${playlistID}/tracks`, data);

export default addTrackToPlaylist;
