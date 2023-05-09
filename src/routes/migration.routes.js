const controller = require("../controllers/migration.controller");

function load(routes) {
  routes.get("/migration/exportarproduto", controller.exportarProduto);
}

module.exports = { load };
