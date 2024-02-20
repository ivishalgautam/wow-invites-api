"use strict";
import controller from "./controller.js";

export default async function routes(fastify, options) {
  fastify.post("/", {}, controller.create);
  fastify.post("/status/:id", {}, controller.checkStatus);
}
