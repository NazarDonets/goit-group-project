import axios from 'axios';

const API_KEY = '00196fbc08c9fb63cbb7cc63efd25ed1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500/';

export async function getInitialData() {
  try {
    const { data } = await axios.get(`${BASE_URL}/trending/all/day`, {
      params: {
        api_key: API_KEY,
      },
    });

    const genre = {};
    const movieGenres = await getMovieGenres();
    const tvGenres = await getTvGenres();

    const allGenresArray = [...movieGenres, ...tvGenres];

    allGenresArray.forEach(elem => {
      genre[elem.id] = elem;
    });

    return data.results.map(elem => {
      return {
        title: elem.title ? elem.title : elem.name,
        id: elem.id,
        image: `${IMG_URL + elem.poster_path}`,
        year: new Date(
          elem.first_air_date ? elem.first_air_date : elem.release_date
        ).getFullYear(),
        genres: elem.genre_ids
          .map(genreId => {
            return genre[genreId]?.name;
          })
          .join(', '),
      };
    });
  } catch (err) {
    return err;
  }
}

async function getMovieGenres() {
  try {
    const {
      data: { genres },
    } = await axios.get(`${BASE_URL}/genre/movie/list`, {
      params: {
        api_key: API_KEY,
      },
    });
    return genres;
  } catch (err) {
    return err;
  }
}

async function getTvGenres() {
  try {
    const {
      data: { genres },
    } = await axios.get(`${BASE_URL}/genre/tv/list`, {
      params: {
        api_key: API_KEY,
      },
    });
    return genres;
  } catch (err) {
    return err;
  }
}
