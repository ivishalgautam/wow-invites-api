"use strict";
import controller from "./controller.js";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    slug: { type: "string" },
  },
  required: ["name", "slug"],
};

export default async function routes(fastify, options) {
  fastify.post("/", schema, controller.create);
  fastify.put("/:id", {}, controller.updateById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:slug", {}, controller.getBySlug);
  fastify.get("/", {}, controller.get);
  fastify.get("/getById/:id", {}, controller.getById);
}
