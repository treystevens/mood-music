import axios from './index';
import { id } from '../user';

const createPlaylist = data => axios.post(`/users/${id}/playlists`, data);

export default createPlaylist;
