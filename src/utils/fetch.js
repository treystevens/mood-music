// GET Request to Spotify API
// !!! Fetch
function spotifyGrab(url, accessToken) {
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
