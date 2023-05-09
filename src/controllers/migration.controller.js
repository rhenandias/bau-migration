const MigrationBusiness = require("../business/migration.business");

module.exports = {
  async exportarProduto(req, res, next) {
    try {
      const { sku, exportarDescricao, exportarImagens, exportarSEO } = req.query;

      const response = await MigrationBusiness.exportarProduto(
        sku,
        exportarDescricao,
        exportarImagens,
        exportarSEO
      );

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
};
