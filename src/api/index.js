import axios from 'axios';
import getURLParameter from '../utils/getURLParameter';

const accessToken = getURLParameter('access_token');

const instance = axios.create({
  baseURL: 'https://api.spotify.com/v1/',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${accessToken}`
  }
});

export default instance;
