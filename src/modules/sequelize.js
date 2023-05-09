const Sequelize = require("sequelize");
const config = require("../../sequelize/config");

const initModels = require("../../sequelize/models/init-models");

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const models = initModels(sequelize);

module.exports = { sequelize, models };
