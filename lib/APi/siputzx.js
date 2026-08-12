const axios = require("axios");

const SIPUTZX_BASE = "https://api.siputzx.my.id/api";

const siputzx = async (endpoint, params = {}) => {
  const res = await axios.get(SIPUTZX_BASE + endpoint, { params });
  return res.data;
};

global.siputzx = siputzx;