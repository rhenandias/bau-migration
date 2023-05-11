const controller = require("../controllers/migration.controller");

function load(routes) {
  routes.get("/migration/exportarproduto", controller.exportarProduto);
  routes.get("/migration/dumpmagento", controller.dumpProdutosMagento);
  routes.get("/migration/executarmigracao", controller.executarMigracao);
}

module.exports = { load };
