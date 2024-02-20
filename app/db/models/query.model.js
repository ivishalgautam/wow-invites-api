"use strict";
import { DataTypes, Deferrable } from "sequelize";
import constants from "../../lib/constants/index.js";

let QueryModel = null;

const init = async (sequelize) => {
  QueryModel = sequelize.define(
    constants.models.QUERY_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      details: {
        type: DataTypes.JSONB,
        defaultValue: "[]",
      },
      delivery_date: { type: DataTypes.STRING, allowNull: false },
      is_completed: { type: DataTypes.BOOLEAN, defaultValue: false },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.USER_TABLE,
          defferable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
      template_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.TEMPLATE_TABLE,
          defferable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await QueryModel.sync({ alter: true });
};

const create = async ({ details, delivery_date, user_id, template_id }) => {
  return await QueryModel.create({
    details: details,
    delivery_date: delivery_date,
    user_id: user_id,
    template_id: template_id,
  });
};

const updateById = async (
  { details, delivery_date, is_completed },
  query_id
) => {
  const [rowCount, rows] = await QueryModel.update(
    {
      details: details,
      delivery_date: delivery_date,
      is_completed: is_completed,
    },
    {
      where: { id: query_id },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const get = async (req) => {
  return await QueryModel.findAll({});
};

const getById = async (query_id) => {
  if (!query_id) return null;
  return await QueryModel.findOne({
    where: { id: query_id },
  });
};

const deleteById = async (req, query_id) => {
  return await QueryModel.destroy({
    where: { id: req.params.id || query_id },
  });
};

export default {
  init: init,
  create: create,
  updateById: updateById,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
