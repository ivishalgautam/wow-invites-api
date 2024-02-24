"use strict";
import jwtVerify from "../../helpers/auth.js";
import userRoutes from "../../api/users/routes.js";
import templateRoutes from "../../api/template/routes.js";
import queryRoutes from "../../api/query/routes.js";
import categoryRoutes from "../../api/category/routes.js";
import bannerRoutes from "../../api/banner/routes.js";

export default async function routes(fastify, options) {
  fastify.addHook("onRequest", jwtVerify.verifyToken);
  fastify.register(userRoutes, { prefix: "users" });
  fastify.register(templateRoutes, { prefix: "templates" });
  fastify.register(queryRoutes, { prefix: "queries" });
  fastify.register(categoryRoutes, { prefix: "categories" });
  fastify.register(bannerRoutes, { prefix: "banners" });
}
