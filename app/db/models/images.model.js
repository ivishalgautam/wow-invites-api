"use strict";
import { DataTypes, Deferrable } from "sequelize";
import constants from "../../lib/constants/index.js";

let ImagesModel = null;

const init = async (sequelize) => {
  ImagesModel = sequelize.define(
    constants.models.IMAGE_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      page_number: { type: DataTypes.STRING, allowNull: false },
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

  await ImagesModel.sync({ alter: true });
};

const create = async ({ url, page_number, template_id }) => {
  return await ImagesModel.create({
    url: url,
    page_number: page_number,
    template_id: template_id,
  });
};

const updateById = async ({ url, page_number, template_id }, image_id) => {
  return await ImagesModel.update(
    {
      url: url,
      page_number: page_number,
      template_id: template_id,
    },
    {
      where: { id: image_id },
    }
  );
};

const get = async (req) => {
  return await ImagesModel.findAll({});
};

const getById = async (image_id) => {
  if (!image_id) return null;
  return await ImagesModel.findOne({
    where: { id: image_id },
    plain: true,
    raw: true,
  });
};

const deleteById = async (req, image_id) => {
  return await ImagesModel.destroy({
    where: { id: req.params.id || image_id },
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
