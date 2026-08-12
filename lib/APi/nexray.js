const axios = require("axios");

const BASE_URL = "https://api.nexray.eu.cc";

const nexray = {
  async get(endpoint, params = {}) {
    const res = await axios.get(BASE_URL + endpoint, {
      params,
      responseType: "arraybuffer",
      validateStatus: () => true
    });

    const type = res.headers["content-type"] || "";

    if (type.startsWith("image/")) {
      return Buffer.from(res.data);
    }

    return JSON.parse(Buffer.from(res.data).toString("utf8"));
  },

  async post(endpoint, data = {}) {
    const res = await axios.post(BASE_URL + endpoint, data);
    return res.data;
  }
};

global.nexray = nexray;