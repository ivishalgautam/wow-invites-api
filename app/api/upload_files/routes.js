"use strict";

import controller from "./controller.js";

export default async (fastify, options) => {
  fastify.get("/", {}, controller.getFile);
  fastify.delete("/", {}, controller.deleteFile);
  fastify.post("/files", {}, controller.uploadFiles);
  //   fastify.post("/video", {}, controller.uploadVideo);
  //   fastify.delete("/video", {}, controller.deleteVideoFile);
};
