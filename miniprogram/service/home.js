const { wxRequest } = require("../utils/request.js");
const { baseUrl } = require("../config/index.js");

export const getHomeList = (options) =>
  wxRequest({
    data: options,
    method: "GET",
    url: `${baseUrl}/v1/home/list`,
    // url: `${baseUrl}/v1/home/list`,
  });

export const getHomeDetail = (options) =>
  wxRequest({
    data: options,
    method: "GET",
    // url: `${baseUrl}/v1/home/detail`,
    url: `http://192.168.144.87:8765/v1/home/detail`,
  });
