import { fetchData, formatResponseData, renderMoviesList } from './api-service';

fetchData('/trending/all/week').then(formatResponseData).then(renderMoviesList);
