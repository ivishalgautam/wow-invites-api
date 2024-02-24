"use strict";
import controller from "./controller.js";

const schema = {
  body: {
    type: "",
    properties: {
      image: { type: "string" },
    },
    required: ["image"],
  },
};

export default async function routes(fastify, options) {
  fastify.post("/", schema, controller.create);
  fastify.put("/:id", {}, controller.updateById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/:id", {}, controller.getById);
}
