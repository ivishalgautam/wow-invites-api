"use strict";
import { DataTypes, Deferrable } from "sequelize";
import constants from "../../lib/constants/index.js";

let FieldModel = null;

const init = async (sequelize) => {
  FieldModel = sequelize.define(
    constants.models.FIELDS_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("text", "textarea", "date"),
        defaultValue: "text",
      },
      name: { type: DataTypes.STRING, allowNull: false },
      placeholder: { type: DataTypes.STRING, allowNull: false },
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

  await FieldModel.sync({ alter: true });
};

const create = async ({
  type,
  page_number,
  placeholder,
  template_id,
  name,
}) => {
  return await FieldModel.create({
    type: type,
    page_number: page_number,
    placeholder: placeholder,
    template_id: template_id,
    name: name,
  });
};

const updateById = async (
  { type, page_number, placeholder, template_id, name },
  field_id
) => {
  const [rowCount, rows] = await FieldModel.update(
    {
      type: type,
      page_number: page_number,
      placeholder: placeholder,
      template_id: template_id,
      name: name,
    },
    {
      where: { id: field_id },
      returning: true,
      plain: true,
      raw: true,
    }
  );

  return rows;
};

const get = async (req) => {
  return await FieldModel.findAll({});
};

const getById = async (field_id) => {
  if (!field_id) return null;
  return await FieldModel.findOne({
    where: { id: field_id },
  });
};

const deleteById = async (req, field_id) => {
  return await FieldModel.destroy({
    where: { id: req.params.id || field_id },
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
