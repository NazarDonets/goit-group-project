import { getInitialData, getGenres } from './api-service';
import movieCardTpl from './../templates/movie-card.hbs';

let currentPage;

let genresList;

let moviesList = document.querySelector('.movie-list');

function getCurrentPage() {
  let currentUrl = window.location.href;
  currentUrl.includes('library')
    ? (currentPage = 'library')
    : (currentPage = 'home');

  document
    .querySelector(`[data-${currentPage}]`)
    .classList.add('nav-link__active');
}

getCurrentPage();

async function renderUI() {
  genresList = await getGenres();

  getInitialData(genresList).then(data => {
    moviesList.innerHTML = data.map(elem => movieCardTpl(elem)).join('');
  });
}

renderUI();
