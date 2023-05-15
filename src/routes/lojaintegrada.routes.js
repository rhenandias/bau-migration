const controller = require("../controllers/lojaintegrada.controller");

function load(routes) {
  routes.get("/lojaintegrada/categoria/exportar", controller.exportarCategorias);
}

module.exports = { load };
