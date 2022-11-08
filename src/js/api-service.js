import axios from 'axios';
import movieCardTemplate from './../templates/movie-card.hbs';
import throttle from 'lodash.throttle';

const API_KEY = '00196fbc08c9fb63cbb7cc63efd25ed1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const movieListEl = document.querySelector('.movie-list');

let genresDictionary = {};

async function fetchData(endpoint, page = 1, genres) {
  try {
    const {
      data: { results },
    } = await axios.get(BASE_URL + endpoint, {
      params: {
        api_key: API_KEY,
        page,
        with_genres: genres,
      },
    });
    return results;
  } catch (err) {
    console.error(err);
  }
}

async function getGenres(endpoint) {
  try {
    const {
      data: { genres },
    } = await axios.get(BASE_URL + endpoint, {
      params: {
        api_key: API_KEY,
      },
    });
    return genres;
  } catch (err) {
    console.error(err);
  }
}

async function composeGenresDictionary() {
  if (Object.entries(genresDictionary).length !== 0) {
    return genresDictionary;
  }
  if (Object.entries(genresDictionary).length === 0) {
    const movieGenres = await getGenres('/genre/movie/list');
    const tvGenres = await getGenres('/genre/tv/list');
    [...tvGenres, ...movieGenres].forEach(
      elem => (genresDictionary[elem.id] = elem)
    );
    return genresDictionary;
  }
}

async function formatResponseData(results) {
  genresDictionary = await composeGenresDictionary();
  try {
    const processedObject = await results.map(elem => {
      return {
        id: elem.id,
        title: elem.title ? elem.title : elem.name,
        release_date: new Date(
          elem.release_date ? elem.release_date : elem.first_air_date
        ).getFullYear(),
        poster: IMG_URL + elem.poster_path,
        overview: elem.overview,
        genres: elem.genre_ids
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
          .join(', '),
      };
    });

    return processedObject;
  } catch (err) {
    console.error(err);
  }
}

async function renderUI(data) {
  movieListEl.innerHTML += data.map(elem => movieCardTemplate(elem)).join('');
}

let endpoint = '/discover/movie';
let genres = '16';
let page = 1;

fetchData(endpoint, page, genres).then(formatResponseData).then(renderUI);

const loadMoreBtn = document.querySelector('.js-load-more');

loadMoreBtn.addEventListener('click', () => {
  page += 1;
  fetchData(endpoint, page).then(formatResponseData).then(renderUI);
  console.log('fire');
});

// 12
// :
// {id: 12, name: 'Adventure'}
// 14
// :
// {id: 14, name: 'Fantasy'}
// 16
// :
// {id: 16, name: 'Animation'}
// 18
// :
// {id: 18, name: 'Drama'}
// 27
// :
// {id: 27, name: 'Horror'}
// 28
// :
// {id: 28, name: 'Action'}
// 35
// :
// {id: 35, name: 'Comedy'}
// 36
// :
// {id: 36, name: 'History'}
// 37
// :
// {id: 37, name: 'Western'}
// 53
// :
// {id: 53, name: 'Thriller'}
// 80
// :
// {id: 80, name: 'Crime'}
// 99
// :
// {id: 99, name: 'Documentary'}
// 878
// :
// {id: 878, name: 'Science Fiction'}
// 9648
// :
// {id: 9648, name: 'Mystery'}
// 10402
// :
// {id: 10402, name: 'Music'}
// 10749
// :
// {id: 10749, name: 'Romance'}
// 10751
// :
// {id: 10751, name: 'Family'}
// 10752
// :
// {id: 10752, name: 'War'}
// 10759
// :
// {id: 10759, name: 'Action & Adventure'}
// 10762
// :
// {id: 10762, name: 'Kids'}
// 10763
// :
// {id: 10763, name: 'News'}
// 10764
// :
// {id: 10764, name: 'Reality'}
// 10765
// :
// {id: 10765, name: 'Sci-Fi & Fantasy'}
// 10766
// :
// {id: 10766, name: 'Soap'}
// 10767
// :
// {id: 10767, name: 'Talk'}
// 10768
// :
// {id: 10768, name: 'War & Politics'}
// 10770
// :
// {id: 10770, name: 'TV Movie'}

// window.addEventListener('click', function (e) {
//   e.preventDefault();

//   let data = e.composedPath().find(elem => elem.tagName === 'A');
//   const selectedMovie = {
//     id: Number(data.getAttribute('href')),
//   };

//   if (e.target.tagName !== 'BUTTON') {
//     dataModel.addToWatched(selectedMovie);
//   }

//   if (e.target.tagName === 'BUTTON') {
//     dataModel.removeFromWatched(selectedMovie);
//   }
// });

// const btnEl = document.querySelector('.js-remove');

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
//       console.log(this.addedToWatched);
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
//     console.log(this.addedToWatched);
//   },
// };
