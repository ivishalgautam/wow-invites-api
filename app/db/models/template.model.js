"use strict";
import { DataTypes, QueryTypes, Deferrable, Op } from "sequelize";
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
      thumbnail: { type: DataTypes.TEXT, allowNull: true },
      price: { type: DataTypes.INTEGER, allowNull: false },
      sale_price: { type: DataTypes.INTEGER, allowNull: true },
      tags: { type: DataTypes.ARRAY(DataTypes.STRING), defaultValue: [] },
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
    thumbnail: req.body?.thumbnail,
    price: req.body?.price,
    sale_price: req.body?.sale_price,
    tags: req.body?.tags,
    category_id: req.body?.category_id,
  });
};

const updateById = async (req, template_id) => {
  const [rowCount, rows] = await TemplateModel.update(
    {
      name: req.body?.name,
      slug: req.body.slug,
      url: req.body?.url,
      thumbnail: req.body?.thumbnail,
      price: req.body?.price,
      sale_price: req.body?.sale_price,
      tags: req.body?.tags,
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
  const featured = req?.query?.featured;
  let whereQuery = "";
  const page_number = req?.query.page ?? 1;
  const limit = !req?.query.limit
    ? 10
    : req?.query?.limit > 10
    ? 10
    : req?.query?.limit;

  const offset = (page_number - 1) * limit;
  let threshold = `LIMIT '${limit}' OFFSET '${offset}'`;

  if (featured == "true") {
    whereQuery = `WHERE cat.is_featured = true`;
    threshold = "";
  }

  let query = `
  SELECT
      tmp.id,
      tmp.name,
      tmp.slug,
      tmp.url,
      tmp.thumbnail,
      tmp.price,
      tmp.sale_price,
      tmp.tags,
      tmp.category_id,
      tmp.created_at,
      tmp.updated_at,
      cat.name as category_name,
      cat.id as category_id,
      COUNT(ti.id) as total_images
    FROM templates tmp
    LEFT JOIN categories cat ON cat.id = tmp.category_id
    JOIN template_images ti ON ti.template_id = tmp.id
    ${whereQuery}
    GROUP BY
      tmp.id,
      tmp.name,
      tmp.slug,
      tmp.url,
      tmp.thumbnail,
      tmp.price,
      tmp.sale_price,
      tmp.tags,
      tmp.category_id,
      tmp.created_at,
      tmp.updated_at,
      cat.name,
      cat.id
    ${threshold}
`;

  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

const getById = async (template_id) => {
  const query = `
          SELECT
              tmp.id,
              tmp.name,
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
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
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
              tmp.url,
              tmp.category_id
  `;

  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getBySlug = async (slug) => {
  const query = `
          SELECT
              tmp.id,
              tmp.name,
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
              tmp.url,
              tmp.category_id,
              tmp.slug,
              json_agg(DISTINCT tf.*) as fields,
              json_agg(DISTINCT imgs.*) as images
            FROM templates tmp
            LEFT JOIN template_fields tf ON tf.template_id = tmp.id
            LEFT JOIN template_images imgs ON imgs.template_id = tmp.id
            WHERE tmp.slug = '${slug}'
            GROUP BY
              tmp.id,
              tmp.name,
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
              tmp.url,
              tmp.category_id,
              tmp.slug
  `;
  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    plain: true,
  });
};

const getByCategory = async (slug) => {
  const query = `
          SELECT
              tmp.id,
              tmp.name,
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
              tmp.url,
              tmp.category_id,
              tmp.slug,
              json_agg(DISTINCT tf.*) as fields,
              json_agg(DISTINCT imgs.*) as images
            FROM templates tmp
            LEFT JOIN template_fields tf ON tf.template_id = tmp.id
            LEFT JOIN template_images imgs ON imgs.template_id = tmp.id
            LEFT JOIN categories cat ON tmp.category_id = cat.id
            WHERE cat.slug = '${slug}'
            GROUP BY
              tmp.id,
              tmp.name,
              tmp.thumbnail,
              tmp.price,
              tmp.sale_price,
              tmp.tags,
              tmp.url,
              tmp.category_id,
              tmp.slug
  `;

  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
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

const searchTemplates = async (req) => {
  const q = req.query.q.split("-").join(" ");
  if (!q) return [];

  const query = `
    SELECT t.*
    FROM Templates AS t
    WHERE 
      t.name ILIKE '%${q}%' 
      OR '%${q}%' = ANY(t.tags) 
      OR EXISTS (
        SELECT 1 
        FROM unnest(t.tags) AS tag 
        WHERE tag ILIKE '%${q}%'
      )
  `;

  // Fetch templates and categories based on the search term
  return await TemplateModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });
};

export default {
  init: init,
  create: create,
  updateById: updateById,
  get: get,
  getById: getById,
  getBySlug: getBySlug,
  getByCategory: getByCategory,
  findById: findById,
  deleteById: deleteById,
  findBySlug: findBySlug,
  searchTemplates: searchTemplates,
};
