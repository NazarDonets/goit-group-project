import { localStorageData } from './api-service';
import axios from 'axios';
import movieDetailsModalTemplate from './../templates/movieDetailsModal.hbs';
import movieCardTemplate from './../templates/movie-card.hbs';

console.log(localStorageData);

const libraryMovieListEl = document.querySelector('.movie-list__library');
console.log(libraryMovieListEl);

libraryMovieListEl.innerHTML =
  localStorageData.addedToLocalStorageMovies.queuedList.map(movieCardTemplate);
