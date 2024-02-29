"use strict";
import constants from "../../lib/constants/index.js";
const { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST } = constants.http.status;
import table from "../../db/models.js";

const create = async (req, res) => {
  try {
    const { details, delivery_date, slug } = req.body;
    const template = await table.TemplateModel.findBySlug(slug);

    if (!template) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    await table.QueryModel.create({
      details,
      delivery_date,
      user_id: req.user_data.id,
      template_id: template?.id,
    });

    res.send({ message: "Query sent." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    const { details, delivery_date, template_id } = req.body;

    const template = await table.TemplateModel.getById(template_id);

    if (!template) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    await table.QueryModel.updateById(
      {
        details,
        delivery_date,
        template_id,
      },
      req.params.id
    );

    res.send({ message: "updated" });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const { queries, total_page, page } = await table.QueryModel.get(req);

    res.send({ queries, total_page, page });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.QueryModel.getById(req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "query not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.QueryModel.deleteById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "query not found!" });
    }

    res.send({ message: "query deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  updateById: updateById,
  get: get,
  getById: getById,
  deleteById: deleteById,
};
