"use strict";
import controller from "./controller.js";

const schema = {
  body: {
    type: "",
    properties: {
      details: { type: "string" },
      delivery_date: { type: "string" },
      template_id: { type: "string" },
    },
    required: ["details", "delivery_date", "template_id"],
  },
};

export default async function (fastify, options) {
  fastify.post("/", schema, controller.create);
  fastify.put("/:id", {}, controller.updateById);
  fastify.get("/:id", {}, controller.getById);
  fastify.delete("/:id", {}, controller.deleteById);
  fastify.get("/", {}, controller.get);
}
