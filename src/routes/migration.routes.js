const controller = require("../controllers/migration.controller");

function load(routes) {
  routes.get("/migration/exportarproduto", controller.exportarProduto);
  routes.get("/migration/dumpmagento", controller.dumpProdutosMagento);
  routes.get("/migration/executarmigracao", controller.executarMigracao);
  routes.get("/migration/migrarcategorias", controller.migrarCategorias);
}

module.exports = { load };
