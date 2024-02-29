"use strict";
import constants from "../../lib/constants/index.js";
import slugify from "slugify";
const { NOT_FOUND, INTERNAL_SERVER_ERROR, BAD_REQUEST } = constants.http.status;
import table from "../../db/models.js";

const create = async (req, res) => {
  req.body.slug = slugify(req.body.name, { lower: true });
  try {
    const record = await table.TemplateModel.findBySlug(req.body.slug);

    if (record) {
      return res
        .code(BAD_REQUEST)
        .send({ message: "template exists with this name!" });
    }

    const template = await table.TemplateModel.create(req);

    if (template && req.body.fields) {
      req.body.fields.forEach(async (field) => {
        const { type, page_number, placeholder, name } = field;
        return await new Promise(async (resolve) => {
          await table.FieldModel.create({
            type,
            page_number,
            placeholder,
            template_id: template?.id,
            name: String(name).replace(/\s+/g, "_"),
          });
          resolve();
        });
      });
    }

    if (template && req.body.images) {
      req.body.images.forEach(async (image) => {
        const { url, page_number } = image;
        return await new Promise(async (resolve) => {
          await table.ImageModel.create({
            url,
            page_number,
            template_id: template?.id,
          });
          resolve();
        });
      });
    }

    res.send({ message: "template added" });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const updateById = async (req, res) => {
  req.body.slug = slugify(req.body.name, { lower: true });
  try {
    const slugExist = await table.TemplateModel.findBySlug(req.body.slug);
    const record = await table.TemplateModel.findById(req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    if (slugExist && slugExist?.id !== req.params.id) {
      return res
        .code(BAD_REQUEST)
        .send({ message: "template exist with this name" });
    }

    req.body.slug = slugify(req.body.name, { lower: true });

    const template = await table.TemplateModel.updateById(req, req.params.id);

    if (template && req.body.fields) {
      req.body.fields.forEach(async (field) => {
        console.log({ field });
        const { type, page_number, placeholder, name } = field;
        return await new Promise(async (resolve) => {
          const fieldExist = await table.FieldModel.getById(field?.id);
          if (!fieldExist) {
            await table.FieldModel.create({
              type,
              page_number,
              placeholder,
              template_id: template?.id,
              name: String(name).replace(/\s+/g, "_"),
            });
          } else {
            await table.FieldModel.updateById(
              { type, page_number, placeholder, template_id: template?.id },
              field?.id
            );
          }
          resolve();
        });
      });
    }

    if (template && req.body.images) {
      req.body.images.forEach(async (image) => {
        const { url, page_number } = image;
        return await new Promise(async (resolve) => {
          const imageExist = await table.ImageModel.getById(image?.id);
          console.log({ imageExist });
          if (!imageExist) {
            await table.ImageModel.create({
              url,
              page_number,
              template_id: template?.id,
            });
          } else {
            await table.ImageModel.updateById(
              { url, page_number, template_id: template?.id },
              image?.id
            );
          }
          resolve();
        });
      });
    }
    res.send({ message: "Template updated." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const get = async (req, res) => {
  try {
    res.send(await table.TemplateModel.get(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getFetauredTemplates = async (req, res) => {
  try {
    res.send(await table.TemplateModel.getFeatured(req));
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getById = async (req, res) => {
  try {
    const record = await table.TemplateModel.getById(req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getBySlug = async (req, res) => {
  try {
    const record = await table.TemplateModel.getBySlug(req.params.slug);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const getByCategory = async (req, res) => {
  try {
    const record = await table.TemplateModel.getByCategory(req.params.slug);

    res.send(record);
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteById = async (req, res) => {
  try {
    const record = await table.TemplateModel.deleteById(req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template not found!" });
    }

    res.send({ message: "template deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteFieldById = async (req, res) => {
  console.log(req.params.id);
  try {
    const record = await table.FieldModel.deleteById(req, req.params.id);
    console.log({ record });

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template field not found!" });
    }

    res.send({ message: "template field deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const deleteImageById = async (req, res) => {
  try {
    const record = await table.ImageModel.deleteById(req, req.params.id);

    if (!record) {
      return res.code(NOT_FOUND).send({ message: "template image not found!" });
    }

    res.send({ message: "template image deleted." });
  } catch (error) {
    console.error(error);
    res.code(INTERNAL_SERVER_ERROR).send(error);
  }
};

const searchTemplates = async (req, res) => {
  try {
    const data = await table.TemplateModel.searchTemplates(req);
    res.send(data);
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
  getBySlug: getBySlug,
  getByCategory: getByCategory,
  deleteById: deleteById,
  deleteFieldById: deleteFieldById,
  deleteImageById: deleteImageById,
  getFetauredTemplates: getFetauredTemplates,
  searchTemplates: searchTemplates,
};
