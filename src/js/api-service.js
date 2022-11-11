import axios from 'axios';
import movieCardTemplate from './../templates/movie-card.hbs';
import movieDetailsModalTemplate from './../templates/movieDetailsModal.hbs';

const API_KEY = '00196fbc08c9fb63cbb7cc63efd25ed1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const movieListEl = document.querySelector('.movie-list');
const searchFormEl = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.js-load-more');

let genresDictionary = {};
let page = 1;
let query;
let modalBackdropEl;

export let endpoint = '/trending/all/week';

export async function fetchData(endpoint) {
  try {
    const { data } = await axios.get(BASE_URL + endpoint, {
      params: {
        api_key: API_KEY,
        query: query,
      },
    });
    console.log(data);
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function composeGenresDictionary() {
  if (Object.entries(genresDictionary).length !== 0) {
    return genresDictionary;
  }

  const movieGenres = await fetchData('/genre/movie/list');
  const tvGenres = await fetchData('/genre/tv/list');
  [...tvGenres.genres, ...movieGenres.genres].forEach(
    elem => (genresDictionary[elem.id] = elem)
  );
  return genresDictionary;
}

export async function formatResponseData(data) {
  genresDictionary = await composeGenresDictionary();
  let processedObject;
  try {
    if (data.results) {
      processedObject = await data.results.map(elem => {
        return {
          id: elem.id,
          media_type: elem.media_type,
          title: elem.title ? elem.title : elem.name,
          release_date:
            elem.release_date || elem.first_air_date
              ? new Date(
                  elem.release_date ? elem.release_date : elem.first_air_date
                ).getFullYear()
              : 'No data available',
          poster:
            elem.poster_path !== null
              ? IMG_URL + elem.poster_path
              : 'https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/original.png',
          overview: elem.overview,
          genres:
            elem.genre_ids.length !== 0
              ? elem.genre_ids
                  .map((elem, index) => {
                    if (index < 2) {
                      return genresDictionary[elem].name;
                    }
                    if (index === 2) {
                      return 'Other';
                    }
                    if (index > 2) {
                      return '';
                    }
                  })
                  .filter(elem => elem != '')
                  .join(', ')
              : 'No data available',
        };
      });
    }
    if (!data.results) {
      processedObject = {
        id: data.id,
        media_type: data.media_type,
        title: data.title ? data.title : data.name,
        poster:
          data.poster_path !== null
            ? IMG_URL + data.poster_path
            : 'https://d32qys9a6wm9no.cloudfront.net/images/movies/poster/original.png',
        overview: data?.overview,
        genres:
          data.genres.length !== 0
            ? data.genres.map(elem => elem.name).join(', ')
            : 'No data available',
        rating: data.vote_average.toFixed(1),
        votes: data.vote_count,
        popularity: data.popularity.toFixed(1),
        original_title: data.original_title,
      };
    }
    return processedObject;
  } catch (err) {
    console.error(err);
  }
}

export function renderUI(data) {
  movieListEl.innerHTML += data.map(elem => movieCardTemplate(elem)).join('');
}

async function getCardDetailsMarkup(endpoint, id) {
  try {
    const data = await fetchData(`${endpoint}/${id}`)
      .then(formatResponseData)
      .then(object => movieDetailsModalTemplate(object));
    return data;
  } catch (err) {
    console.error(err);
  }
}

movieListEl.addEventListener('click', async e => {
  e.preventDefault();
  renderMovieDetailsModal(e);
});

async function renderMovieDetailsModal(eventData) {
  let modalEl;
  let endpoint;
  const media_type = eventData.composedPath().find(elem => elem.tagName === 'A')
    .dataset.type;
  const clickedMovieCardId = eventData
    .composedPath()
    .find(elem => elem.tagName === 'A')
    .getAttribute('href');

  if (media_type === 'movie') {
    endpoint = '/movie';
  }

  if (media_type === 'tv') {
    endpoint = '/tv';
  }

  if (!media_type) {
    endpoint = '/movie'; // This is for being able to click on the card on the search results page and render the modal with content
  }

  const movieDetailsMarkup = await getCardDetailsMarkup(
    endpoint,
    clickedMovieCardId
  );

  if (document.querySelector('.modal-backdrop')) {
    modalEl = document.querySelector('.modal');
    return (modalEl.innerHTML = await movieDetailsMarkup);
  }

  if (!document.querySelector('.modal-backdrop')) {
    modalBackdropEl = document.createElement('div');
    modalBackdropEl.classList.add('modal-backdrop');
    modalBackdropEl.innerHTML = movieDetailsMarkup;
    document.body.prepend(modalBackdropEl);
    document.body.style.overflowY = 'hidden';
    modalBackdropEl.addEventListener('click', e => {
      e.preventDefault();

      // Deletes modal from DOM if clicked outside of modal window
      if (
        e.target.className === 'modal-backdrop' ||
        e.composedPath().find(elem => elem.className === 'modal-btn-close')
      ) {
        modalBackdropEl.remove();
        document.body.style.overflowY = '';
      }
    });
  }
}

// ADD TO WATCHED OR QUEUE LISTS

const dataModel = {
  addedToWatched: [],

  addToWatched(selectedMovie) {
    if (this.addedToWatched.find(elem => elem.id === selectedMovie.id)) {
      return;
    } else {
      this.addedToWatched.push(selectedMovie);
      localStorage.setItem(
        'addedToWatched',
        JSON.stringify(this.addedToWatched)
      );
      console.log(this.addedToWatched);
    }
  },
  removeFromWatched(selectedMovie) {
    if (this.addedToWatched.find(elem => elem.id === selectedMovie.id)) {
      this.addedToWatched.splice(
        this.addedToWatched.findIndex(elem => elem.id === selectedMovie.id),
        1
      );
      localStorage.setItem(
        'addedToWatched',
        JSON.stringify(this.addedToWatched)
      );
    } else {
      return;
    }
    console.log(this.addedToWatched);
  },
};

function getSearchResults(query) {
  endpoint = '/search/movie';
  return fetchData(`${endpoint}?query=${query}`);
}

searchFormEl.addEventListener('submit', async e => {
  e.preventDefault();
  movieListEl.innerHTML = '';
  query = searchFormEl.elements.query.value;
  getSearchResults(query).then(formatResponseData).then(renderUI);
});

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  fetchData(endpoint + `?page=${page}`)
    .then(formatResponseData)
    .then(renderUI);
});
