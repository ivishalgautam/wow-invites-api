import config from "../config/index.js";
import { Sequelize } from "sequelize";
import migration from "./index.js";

async function postgresConnection(fastify, options) {
  let dbSuccess = null;

  const sequelize = new Sequelize(
    config.pg_database_name,
    config.pg_username,
    config.pg_password,
    {
      host: config.pg_host,
      dialect: config.pg_dialect,
      logging: false,
    }
  );
  try {
    await sequelize.authenticate();
    fastify.log.info(`Postgres Database connection OK!`);
    await migration.init(sequelize);
    fastify.log.info(`Migration sucessfully completed...`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

export default postgresConnection;
