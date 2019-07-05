import axios from './index';

const getCurrentUsersPlaylists = () => axios.get('/me/playlists');

export default getCurrentUsersPlaylists;
