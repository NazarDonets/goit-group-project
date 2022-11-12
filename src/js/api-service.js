import axios from 'axios';
import movieCardTemplate from './../templates/movie-card.hbs';
import movieDetailsModalTemplate from './../templates/movieDetailsModal.hbs';

const API_KEY = '00196fbc08c9fb63cbb7cc63efd25ed1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const movieListEl = document.querySelector('.movie-list');
const searchFormEl = document.querySelector('.search-form');
const loadMoreBtn = document.querySelector('.js-load-more');
const headerErrorText = document.querySelector('.header-error');
const pageHeadingText = document.querySelector('.page-heading');

let genresDictionary = {};
let modalBackdropEl;
let searchQuery;
let page = 1;

export let endpoint = '/trending/all/week';

let currentPage; // POSSIBLE VALUES ARE "searchResults" or "trending"

function getCurrentPage() {
  if (endpoint === '/trending/all/week') {
    currentPage = 'trending';
  }
  if (endpoint === '/search/multi') {
    currentPage = 'searchResults';
  }
}

export async function fetchData(endpoint) {
  try {
    const { data } = await axios.get(BASE_URL + endpoint, {
      params: {
        api_key: API_KEY,
        query: searchQuery,
      },
    });
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function composeGenresDictionary() {
  if (Object.entries(genresDictionary).length !== 0) {
    // IF GENRES DICTIONARY IS ALREADY AVAILABLE, HERE WE AVOID CALLING THE API
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
  let formattedApiResponse;
  try {
    if (data.results) {
      formattedApiResponse = await data.results.map(elem => {
        if (elem.media_type !== 'person') {
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
            overview: elem?.overview,
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
        }
      });
    }
    if (!data.results && data.media_type !== 'person') {
      formattedApiResponse = {
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
        original_title: data.original_title
          ? data.original_title
          : data.original_name,
      };
    }
    if (Array.isArray(formattedApiResponse)) {
      // REMOVES ALL UNDEFINED OBJECTS FROM THE ARRAY
      return formattedApiResponse.filter(elem => elem !== undefined);
    }
    return formattedApiResponse;
  } catch (err) {
    console.error(err);
  }
}

export function renderMoviesList(data) {
  movieListEl.innerHTML += data.map(elem => movieCardTemplate(elem)).join('');
}

async function getCardDetailsMarkup(endpoint, id) {
  try {
    const data = await fetchData(`${endpoint}/${id}`)
      .then(formatResponseData)
      .then(formattedTvOrMovieObject =>
        movieDetailsModalTemplate(formattedTvOrMovieObject)
      );
    return data;
  } catch (err) {
    console.error(err);
  }
}

// OPENS A TV / MOVIE DETAILS MODAL WINDOW
movieListEl.addEventListener('click', async e => {
  e.preventDefault();
  getCurrentPage();
  renderCardDetailsModal(e);
});

async function renderCardDetailsModal(eventData) {
  // CHECKING THE TYPE OF SELECTED MEDIA - TV OR MOVIE, AS DEPENDING ON THE TYPE THE FIELDS FROM API RESPONSE DIFFER
  const media_type = eventData.composedPath().find(elem => elem.tagName === 'A')
    .dataset.type;

  // GETTING THE ID OF A CLICKED TV/MOVIE CARD ELEMENT
  const clickedMovieCardId = eventData
    .composedPath()
    .find(elem => elem.tagName === 'A')
    .getAttribute('href');

  if (media_type === 'movie') {
    // IF THE CLICKED CARD IS A MOVIE, WE WILL CALL get "/MOVIE" ENDPOINT FOR GETTING MOVIE DETAILS
    endpoint = '/movie';
  }

  if (media_type === 'tv') {
    // IF THE CLICKED CARD IS A TV SHOW, WE WILL CALL get "/TV" ENDPOINT FOR GETTING TV SHOW DETAILS
    endpoint = '/tv';
  }

  const movieDetailsMarkup = await getCardDetailsMarkup(
    endpoint, // HERE IS WHERE THE get "/MOVIE" OR get "/TV" ENDPOINT IS PASSED
    clickedMovieCardId
  );

  modalBackdropEl = document.createElement('div');
  modalBackdropEl.classList.add('modal-backdrop');
  modalBackdropEl.innerHTML = movieDetailsMarkup;
  document.body.prepend(modalBackdropEl);
  document.body.style.overflowY = 'hidden';
  modalBackdropEl.addEventListener('click', e => {
    e.preventDefault();

    // REMOVES THE MODAL FROM THE DOM WHEN CLICKED ON THE CLOSE ICON OR OUTSIDE OF MODAL ELEMENT
    if (
      e.target.className === 'modal-backdrop' ||
      e.composedPath().find(elem => elem.className === 'modal-btn-close')
    ) {
      modalBackdropEl.remove();
      document.body.style.overflowY = '';

      // SETTING ENDPOINT VALUE DEPENDING ON THE PAGE FROM WHICH THE POPUP WAS OPENED.
      if (currentPage === 'searchResults') {
        endpoint = '/search/multi';
      }
      if (currentPage === 'trending') {
        endpoint = '/trending/all/week';
      }
    }
  });
}

async function getSearchResults(searchQuery) {
  return await fetchData(`${endpoint}?query=${searchQuery}`);
}

searchFormEl.addEventListener('submit', async e => {
  // RENDERS THE MOVIE LIST AND UPDATES UI WITH DIFFERENT ERROR TEXT STATES
  // DEPENDING ON THE SEARCH RESULTS AFTER SEARCH QUERY IS SUBMITTED
  e.preventDefault();

  // UPDATING THE ENDPOINT GLOBAL VARIABLE, IT IS REQUIRED FOR
  // USING "LOAD MORE" BUTTON ON THE SEARCH RESULTS PAGE
  endpoint = '/search/multi';
  searchQuery = searchFormEl.elements.query.value;
  if (!searchQuery) {
    // EMPTY STRING VALIDATION
    headerErrorText.textContent = `Please enter search query`;
    headerErrorText.classList.remove('visually-hidden');
    return;
  }
  getSearchResults(searchQuery)
    .then(data => {
      movieListEl.innerHTML = '';
      if (data.results.length === 0) {
        pageHeadingText.textContent = `${data.total_results} matches found`;
        headerErrorText.textContent = `No results found matching ${searchQuery} query`;
        headerErrorText.classList.remove('visually-hidden');
      }
      if (data.results.length !== 0) {
        pageHeadingText.textContent = `${data.total_results} matches found`;
        headerErrorText.classList.add('visually-hidden');
      }
      return formatResponseData(data);
    })
    .then(renderMoviesList);
});

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  // HERE WE USE "ENDPOINT" GLOBAL VARIABLE TO DEFINE FROM WHICH ENDPOINT WE SHOULD REQUEST DATA FOR NEXT PAGE
  fetchData(endpoint + `?page=${page}`)
    .then(formatResponseData)
    .then(renderMoviesList);
});

// WORK IN PROGRESS: ADD TO WATCHED OR QUEUE LISTS

// const dataModel = {
//   addedToWatched: [],

//   addToWatched(selectedMovie) {
//     if (this.addedToWatched.find(elem => elem.id === selectedMovie.id)) {
//       return;
//     } else {
//       this.addedToWatched.push(selectedMovie);
//       localStorage.setItem(
//         'addedToWatched',
//         JSON.stringify(this.addedToWatched)
//       );
//       // console.log(this.addedToWatched);
//     }
//   },
//   removeFromWatched(selectedMovie) {
//     if (this.addedToWatched.find(elem => elem.id === selectedMovie.id)) {
//       this.addedToWatched.splice(
//         this.addedToWatched.findIndex(elem => elem.id === selectedMovie.id),
//         1
//       );
//       localStorage.setItem(
//         'addedToWatched',
//         JSON.stringify(this.addedToWatched)
//       );
//     } else {
//       return;
//     }
//     // console.log(this.addedToWatched);
//   },
// };
