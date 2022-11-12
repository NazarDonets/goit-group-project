import {
  fetchData,
  formatResponseData,
  renderMoviesList,
  endpoint,
} from './api-service';

fetchData(endpoint).then(formatResponseData).then(renderMoviesList);
