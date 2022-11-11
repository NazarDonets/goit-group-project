import { fetchData, formatResponseData, renderUI } from './api-service';

fetchData('/trending/all/week').then(formatResponseData).then(renderUI);
