const NeoxrApi = require("@neoxr/api");

const Api = new NeoxrApi(
  "https://api.neoxr.eu/api",
  global.apiKeys.neoxr
);

global.neoxr = (endpoint, params = {}) => {
  return Api.neoxr(endpoint, params);
};