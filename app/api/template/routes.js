"use strict";
import controller from "./controller.js";

const schema = {
  body: {
    type: "",
    properties: {
      name: { type: "string", minLength: 3 },
      url: { type: "string" },
      price: { type: "number" },
      sale_price: { type: "number" },
    },
    required: ["name", "url", "price"],
  },
};

export default async function routes(fastify, options) {
  fastify.post("/", schema, controller.create);
  fastify.put("/:id", {}, controller.updateById);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.delete("/field/:id", {}, controller.deleteFieldById);
  fastify.delete("/image/:id", {}, controller.deleteImageById);
}
