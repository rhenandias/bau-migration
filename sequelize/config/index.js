const databaseConfig = {
  username: process.env.DB_USER_NAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  host: process.env.DB_HOST_NAME,
  logging: false,
  dialect: "mysql",
  timezone: "-03:00",
  dialectOptions: {
    dateStrings: true,
  },
};

module.exports = databaseConfig;
