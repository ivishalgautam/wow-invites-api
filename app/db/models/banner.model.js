"use strict";
import constants from "../../lib/constants/index.js";
import { DataTypes } from "sequelize";

let BannerModel = null;

const init = async (sequelize) => {
  BannerModel = sequelize.define(
    constants.models.BANNER_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        unique: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );
  await BannerModel.sync({ alter: true });
};

const create = async (req) => {
  return await BannerModel.create({ image: req.body.image });
};

const get = async (req) => {
  return await BannerModel.findAll({});
};

const update = async (req, id) => {
  const [rowCount, rows] = await BannerModel.update(
    {
      image: req.body.image,
    },
    {
      where: {
        id: req.params.id || id,
      },
      returning: true,
      raw: true,
    }
  );

  return rows[0];
};

const getById = async (req, id) => {
  return await BannerModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const deleteById = async (req, id) => {
  return await BannerModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  deleteById: deleteById,
};
