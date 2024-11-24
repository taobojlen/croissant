import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("/api/v1/results", "routes/api/v1/results.ts"),
] satisfies RouteConfig;
