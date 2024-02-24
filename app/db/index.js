"use strict";
import models from "./models.js";

let sequelize;

const init = async (sequelizeObj) => {
  sequelize = sequelizeObj;
  const modelsName = Object.keys(models);

  for await (const modelName of modelsName) {
    new Promise((resolve) => {
      models[modelName].init(sequelize);
      resolve({ modelName });
    });
  }
};

export default {
  init,
};
