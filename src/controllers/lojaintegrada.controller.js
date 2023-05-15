const LojaIntegradaBusines = require("../business/lojaintegrada.business");

module.exports = {
  async exportarCategorias(req, res, next) {
    try {
      const response = await LojaIntegradaBusines.exportarCategorias();

      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
