const { sequelize } = require("../modules/sequelize");
const { SequelizeAuto } = require("sequelize-auto");

module.exports = {
  async connection() {
    try {
      await sequelize.authenticate();

      return "Conexão estabelecida com sucesso";
    } catch (error) {
      return `Não foi possível realizar a conexão com o banco de dados: ${error}`;
    }
  },

  async generate() {
    const options = {
      directory: "sequelize/models",
      noAlias: true,
    };

    const auto = new SequelizeAuto(sequelize, null, null, options);

    await auto.run();

    return "Modelos do banco criados com sucesso.";
  },
};
