import {
  fetchData,
  formatResponseData,
  renderUI,
  endpoint,
} from './api-service';

fetchData(endpoint).then(formatResponseData).then(renderUI);
