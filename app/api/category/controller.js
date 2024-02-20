"use strict";
import constants from "../../lib/constants/index.js";
import table from "../../db/models.js";
import slugify from "slugify";
import fileController from "../upload_files/controller.js";

const create = async (req, res) => {
  try {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;
    const record = await table.CategoryModel.getBySlug(req, slug);

    if (record)
      return res
        .code(constants.http.status.BAD_REQUEST)
        .send({ message: "Product exist with this name!" });

    const product = await table.CategoryModel.create(req);
    res.send(product);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  try {
    let slug = slugify(req.body.name, { lower: true });
    req.body.slug = slug;

    const record = await table.CategoryModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Category not found!" });
    }

    const slugExist = await table.CategoryModel.getBySlug(req, req.body.slug);

    // Check if there's another Product with the same slug but a different ID
    if (slugExist && record?.id !== slugExist?.id)
      return res
        .code(constants.http.status.FORBIDDEN)
        .send({ message: "Product exist with this title!" });

    res.send(await table.CategoryModel.update(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    let slug = slugify(req.body.title, { lower: true });
    req.body.slug = slug;

    const record = await table.CategoryModel.getBySlug(req, req.params.slug);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Category not found!" });
    }

    res.send(await table.CategoryModel.getById(req, req.params.id));
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.CategoryModel.getById(req, req.params.id);

    if (!record) {
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Category not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    const products = await table.CategoryModel.get(req);
    res.send(products);
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.CategoryModel.getById(req, req.params.id);

    if (!record)
      return res
        .code(constants.http.status.NOT_FOUND)
        .send({ message: "Category not found!" });

    await table.CategoryModel.deleteById(req, req.params.id);
    req.query.file_path = record?.image;
    fileController.deleteFile(req, res);
    res.send({ mesage: "Category deleted." });
  } catch (error) {
    console.error(error);
    res.code(constants.http.status.INTERNAL_SERVER_ERROR).send(error);
  }
};

export default {
  create: create,
  get: get,
  updateById: updateById,
  deleteById: deleteById,
  getBySlug: getBySlug,
  getById: getById,
};
