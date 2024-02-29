"use strict";
import { DataTypes, Deferrable, QueryTypes } from "sequelize";
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
  return await QueryModel.create(
    {
      details: details,
      delivery_date: delivery_date,
      user_id: user_id,
      template_id: template_id,
    },
    { returning: true, plain: true, raw: true }
  );
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
  const page = !req?.query?.page
    ? 1
    : req?.query?.page < 1
    ? 1
    : req?.query?.page;

  const limit = !req?.query?.limit
    ? 10
    : req?.query?.limit > 100
    ? 100
    : req?.query?.limit;

  const offset = (page - 1) * limit;
  let threshold = `LIMIT '${limit}' OFFSET '${offset}';`;

  const query = `
    SELECT
        qr.*,
        CONCAT(usr.first_name, ' ', usr.last_name) as user_fullname,
        usr.email,
        usr.mobile_number,
        tmp.name as template_name
    FROM queries qr
    LEFT JOIN users usr ON usr.id = qr.user_id
    LEFT JOIN templates tmp ON tmp.id = qr.template_id
    ${threshold}
  `;
  const queries = await QueryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
  });

  const { total } = await QueryModel.sequelize.query(
    `SELECT COUNT(*) AS total FROM queries;`,
    {
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  return {
    queries,
    total_page: Math.ceil(Number(total) / Number(limit)),
    page,
  };
};

const getById = async (query_id) => {
  if (!query_id) return null;

  const query = `
  SELECT
      qr.id,
      qr.details,
      qr.delivery_date,
      qr.is_completed,
      qr.user_id,
      qr.template_id,
      CONCAT(usr.first_name, ' ', usr.last_name) as user_fullname,
      json_agg(DISTINCT
        jsonb_build_object(
            'id', f.id,
            'name', f.name,
            'page_number', f.page_number,
            'type', f.type,
            'value', d->>'value'
        )
      ) as fields,
      json_agg(DISTINCT imgs.*) as images
  FROM queries qr
  LEFT JOIN users usr ON usr.id = qr.user_id
  LEFT JOIN templates tmp ON tmp.id = qr.template_id
  LEFT JOIN template_images imgs ON imgs.template_id = qr.template_id
  LEFT JOIN LATERAL
      jsonb_array_elements(qr.details) AS d ON true
  LEFT JOIN
      template_fields f ON f.id = (d->>'field_id')::uuid
  WHERE qr.id = '${query_id}'    
  GROUP BY
      qr.id,
      qr.details,
      qr.delivery_date,
      qr.is_completed,
      qr.user_id,
      qr.template_id,
      CONCAT(usr.first_name, ' ', usr.last_name)
`;

  return await QueryModel.sequelize.query(query, {
    type: QueryTypes.SELECT,
    raw: true,
    plain: true,
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
