"use strict";
import constants from "../../lib/constants/index.js";
import sequelizeFwk, { QueryTypes } from "sequelize";

let CategoryModel = null;

const init = async (sequelize) => {
  CategoryModel = sequelize.define(
    constants.models.CATEGORY_TABLE,
    {
      id: {
        primaryKey: true,
        allowNull: false,
        type: sequelizeFwk.DataTypes.UUID,
        defaultValue: sequelizeFwk.DataTypes.UUIDV4,
        unique: true,
      },
      name: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      image: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: true,
      },
      slug: {
        type: sequelizeFwk.DataTypes.STRING,
        allowNull: false,
      },
      is_featured: {
        type: sequelizeFwk.DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  await CategoryModel.sync({ alter: true });
};

const create = async (req) => {
  return await CategoryModel.create({
    name: req.body.name,
    image: req.body.image,
    slug: req.body.slug,
    is_featured: req.body.is_featured,
  });
};

const get = async (req) => {
  let threshold = "";
  const page = !req?.query?.page
    ? null
    : req?.query?.page < 1
    ? 1
    : req?.query?.page;

  const limit = !req?.query?.limit
    ? null
    : req?.query?.limit
    ? req?.query?.limit
    : 10;

  if (page && limit) {
    const offset = (page - 1) * limit;
    threshold = `LIMIT '${limit}' OFFSET '${offset}';`;
  }

  let query = `
    SELECT 
        cat.id,
        cat.name,
        cat.created_at,
        cat.updated_at,
        cat.slug,
        cat.image,
        cat.is_featured,
        COUNT(tmp.id) as total_templates
      FROM categories cat
      LEFT JOIN templates tmp ON tmp.category_id = cat.id
      GROUP BY 
        cat.id,
        cat.name,
        cat.created_at,
        cat.updated_at,
        cat.slug,
        cat.image,
        cat.is_featured
      ORDER BY cat.created_at DESC
      ${threshold}
  `;

  // console.log(query);

  const categories = await CategoryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const { total } = await CategoryModel.sequelize.query(
    `SELECT COUNT(*) AS total FROM categories;`,
    {
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  return {
    categories,
    total_page: Math.ceil(Number(total) / Number(limit)),
    page: page,
  };
};

const update = async (req, id) => {
  const [rowCount, rows] = await CategoryModel.update(
    {
      name: req.body.name,
      image: req.body.image,
      slug: req.body.slug,
      is_featured: req.body.is_featured,
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
  return await CategoryModel.findOne({
    where: {
      id: req.params.id || id,
    },
  });
};

const getBySlug = async (req, slug) => {
  return await CategoryModel.findOne({
    where: {
      slug: req.params.slug || slug,
    },
    raw: true,
  });
};

const deleteById = async (req, id) => {
  return await CategoryModel.destroy({
    where: { id: req.params.id || id },
  });
};

export default {
  init: init,
  create: create,
  get: get,
  update: update,
  getById: getById,
  getBySlug: getBySlug,
  deleteById: deleteById,
};
