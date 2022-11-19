import {
  fetchData,
  formatResponseData,
  renderMoviesList,
  endpoint,
  updateMovieItemStatus,
} from './api-service';

fetchData(endpoint)
  .then(formatResponseData)
  .then(renderMoviesList)
  .then(updateMovieItemStatus);
