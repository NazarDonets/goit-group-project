import { localStorageData, updateMovieItemStatus } from './api-service';
import axios from 'axios';
import movieDetailsModalTemplate from './../templates/movieDetailsModal.hbs';
import movieCardTemplate from './../templates/movie-card.hbs';

console.log(localStorageData);

const libraryMovieListEl = document.querySelector('.movie-list__library');
const libraryListsButtons = document.querySelector('.header-buttons');
const libraryWatchedListBtn = document.querySelector('[data-watched]');
const libraryQueueListBtn = document.querySelector('[data-queue]');

libraryListsButtons.addEventListener('click', renderLibraryMoviesList);

libraryMovieListEl.innerHTML =
  localStorageData.addedToLocalStorageMovies.watchedList
    .map(movieCardTemplate)
    .join('');

updateMovieItemStatus();

function renderLibraryMoviesList(event) {
  if (event.target === libraryWatchedListBtn) {
    libraryMovieListEl.innerHTML =
      localStorageData.addedToLocalStorageMovies.watchedList
        .map(movieCardTemplate)
        .join('');
  }
  if (event.target === libraryQueueListBtn) {
    libraryMovieListEl.innerHTML =
      localStorageData.addedToLocalStorageMovies.queuedList
        .map(movieCardTemplate)
        .join('');
  }
  updateMovieItemStatus();
}
