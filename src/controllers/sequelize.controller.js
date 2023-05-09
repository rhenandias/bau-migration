const SequelizeBusiness = require("../business/sequelize.business");

module.exports = {
  async connection(req, res, next) {
    try {
      const response = await SequelizeBusiness.connection();

      return res.status(200).json({
        message: response,
      });
    } catch (error) {
      next(error);
    }
  },

  async generate(req, res, next) {
    try {
      const response = await SequelizeBusiness.generate();

      return res.status(200).json({
        message: response,
      });
    } catch (error) {
      next(error);
    }
  },
};
