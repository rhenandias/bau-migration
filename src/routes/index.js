const fs = require("fs");

const express = require("express");
const routes = express.Router();

fs.readdirSync(__dirname).forEach((file) => {
  if (!file.includes("index.js")) {
    const module = require("./" + file);
    module.load(routes);
  }
});

module.exports = routes;
