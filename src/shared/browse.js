import { GENRES } from './constants';

let browseURL = '';

function buildURL(maxVal, minVal, moodFeatures) {
  browseURL = `recommendations?max_valence=${maxVal}&min_valence=${minVal}&limit=30`;
  const { minEnergy, maxEnergy } = moodFeatures[0];

  if (minEnergy) {
    browseURL += `&min_energy=${moodFeatures[0].minEnergy}`;
  }
  if (maxEnergy) {
    browseURL += `&max_energy=${moodFeatures[0].maxEnergy}`;
  }
  handleGenres(getGenres());
  return browseURL;
}

function handleGenres(genres) {
  let buildGenres = '';

  // Use user chosen genres
  if (genres.length > 0) {
    genres.forEach((genre, index) => {
      if (index === 0) {
        buildGenres += `&seed_genres=${genre}`;
      } else {
        buildGenres += `,${genre}`;
      }
    });
  } else {
    // Randomize 5 genres if no genres were chosen
    for (let i = 0; i < 5; i++) {
      const randomNumber = Math.floor(
        Math.random() * Math.floor(GENRES.length)
      );

      if (buildGenres === '')
        buildGenres = `&seed_genres=${GENRES[randomNumber]}`;
      else {
        buildGenres += `,${GENRES[randomNumber]}`;
      }
    }
  }
  browseURL += buildGenres;
}

function getGenres() {
  const chosenGenreElems = Array.from(
    document.querySelectorAll('.genres-toggle')
  );
  const genres = [];
  const modalGenreView = document.querySelector('.genres-show');

  if (modalGenreView) {
    modalGenreView.classList.remove('genres-show');
  }

  chosenGenreElems.forEach(elem => {
    elem.classList.remove('genres-toggle');
    genres.push(formatGenre(elem.textContent));
  });

  return genres;
}

function formatGenre(genre) {
  const regex = /&/g;
  let formattedGenre = genre.toLowerCase();

  if (genre === 'r & b' || genre === 'rock & roll') {
    formattedGenre = genre.replace(regex, 'n');
  }
  if (genre === 'drum & bass') {
    formattedGenre = genre.replace(regex, 'and');
  }
  return formattedGenre;
}

export { browseURL, buildURL };
