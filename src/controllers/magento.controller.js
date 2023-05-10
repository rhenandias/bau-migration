const MagentoBusiness = require("../business/magento.business");

module.exports = {
  async flow(req, res, next) {
    try {
      const response = await MagentoBusiness.flow();

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async salesOrderList(req, res, next) {
    try {
      const response = await MagentoBusiness.salesOrderList();

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async catalogProductInfo(req, res, next) {
    try {
      const { productId } = req.query;

      const response = await MagentoBusiness.catalogProductInfo(productId);

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async catalogProductList(req, res, next) {
    try {
      const response = await MagentoBusiness.catalogProductList();

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async catalogProductAttributeMediaList(req, res, next) {
    try {
      const { productId } = req.query;

      const response = await MagentoBusiness.catalogProductAttributeMediaList(productId);

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async catalogProductAttributeList(req, res, next) {
    try {
      const { setId } = req.query;

      const response = await MagentoBusiness.catalogProductAttributeList(setId);

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async salesOrderInfo(req, res, next) {
    try {
      const { orderIncrementId } = req.query;

      const response = await MagentoBusiness.salesOrderInfo(orderIncrementId);

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },

  async catalogCategoryTree(req, res, next) {
    try {
      const response = await MagentoBusiness.catalogCategoryTree();

      res.status(200).json({ message: response });
    } catch (error) {
      next(error);
    }
  },
};
