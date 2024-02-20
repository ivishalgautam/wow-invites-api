"use strict";
import { DataTypes, QueryTypes, Deferrable } from "sequelize";
import constants from "../../lib/constants/index.js";

let TemplateModel = null;

const init = async (sequelize) => {
  TemplateModel = sequelize.define(
    constants.models.TEMPLATE_TABLE,
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      url: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.INTEGER, allowNull: false },
      sale_price: { type: DataTypes.INTEGER, allowNull: true },
      category_id: {
        type: DataTypes.UUID,
        allowNull: false,
        onDelete: "CASCADE",
        references: {
          model: constants.models.CATEGORY_TABLE,
          key: "id",
          deferrable: Deferrable.INITIALLY_IMMEDIATE,
        },
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await TemplateModel.sync({ alter: true });
};

const create = async (req) => {
  return await TemplateModel.create({
    name: req.body?.name,
    slug: req.body?.slug,
    url: req.body?.url,
    price: req.body?.price,
    sale_price: req.body?.sale_price,
    category_id: req.body?.category_id,
  });
};

const updateById = async (req, template_id) => {
  const [rowCount, rows] = await TemplateModel.update(
    {
      name: req.body?.name,
      slug: req.body.slug,
      url: req.body?.url,
      price: req.body?.price,
      sale_price: req.body?.sale_price,
      category_id: req.body?.category_id,
    },
    {
      where: { id: req.params.id || template_id },
      returning: true,
      plain: true,
    }
  );

  return rows;
};

const get = async (req) => {
  return await TemplateModel.findAll({});
};

const getById = async (template_id) => {
  const query = `
          SELECT
              tmp.id,
              tmp.name,
              tmp.price,
              tmp.sale_price,
              tmp.url,
              tmp.category_id,
              json_agg(DISTINCT tf.*) as fields,
              json_agg(DISTINCT imgs.*) as images
            FROM templates tmp
            LEFT JOIN template_fields tf ON tf.template_id = tmp.id
            LEFT JOIN template_images imgs ON imgs.template_id = tmp.id
            WHERE tmp.id = '${template_id}'
            GROUP BY
              tmp.id,
              tmp.name,
              tmp.price,
              tmp.sale_price,
              tmp.url,
              tmp.category_id
  `;
  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const findById = async (template_id) => {
  return await TemplateModel.findOne({
    where: { id: template_id },
  });
};

const deleteById = async (template_id) => {
  return await TemplateModel.destroy({
    where: { id: template_id },
  });
};

const findBySlug = async (slug) => {
  return await TemplateModel.findOne({
    where: { slug: slug },
    raw: true,
    plain: true,
  });
};

export default {
  init: init,
  create: create,
  updateById: updateById,
  get: get,
  getById: getById,
  findById: findById,
  deleteById: deleteById,
  findBySlug: findBySlug,
};
