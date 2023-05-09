const controller = require("../controllers/sequelize.controller");

function load(routes) {
  routes.get("/sequelize/connection", controller.connection);
  routes.get("/sequelize/generate", controller.generate);
}

module.exports = { load };
