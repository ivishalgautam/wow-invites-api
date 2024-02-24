import fastifyMultipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import fastifyFormBody from "@fastify/formbody";
import { fileURLToPath } from "url";
import cors from "@fastify/cors";
import { dirname } from "path";
import path from "path";

// import internal modules
import authRoutes from "./app/api/auth/routes.js";
import pg_database from "./app/db/postgres.js";
import routes from "./app/routes/v1/index.js";
import uploadFileRoutes from "./app/api/upload_files/routes.js";
import paymentRoutes from "./app/api/payment/routes.js";

import templateController from "./app/api/template/controller.js";
import categoriesController from "./app/api/category/controller.js";
import bannerController from "./app/api/banner/controller.js";
/*
    Register External packages, routes, database connection
*/

export default (app) => {
  app.register(fastifyStatic, {
    root: path.join(dirname(fileURLToPath(import.meta.url), "public")),
  });
  app.register(cors, { origin: "*" });
  app.register(pg_database);
  app.register(fastifyMultipart, {
    limits: { fileSize: 5 * 1024 * 1024 * 1024 }, // Set the limit to 5 GB or adjust as needed
  });
  app.register(fastifyFormBody);
  // Increase the payload size limit
  app.register(routes, { prefix: "v1" });
  app.register(authRoutes, { prefix: "v1/auth" });
  app.register(paymentRoutes, { prefix: "v1/payment" });

  // tmplates
  app.get("/v1/templates", {}, templateController.get);
  app.get("/v1/templates/getBySlug/:slug", {}, templateController.getBySlug);
  app.get(
    "/v1/templates/getByCategory/:slug",
    {},
    templateController.getByCategory
  );
  app.get("/v1/templates/search", {}, templateController.searchTemplates);

  // category
  app.get("/v1/categories", {}, categoriesController.get);
  app.get("/v1/categories/:slug", {}, categoriesController.getBySlug);

  // banner
  app.get("/v1/banners", {}, bannerController.get);

  // upload
  app.register(uploadFileRoutes, { prefix: "v1/upload" });
};
