import { index, type RouteConfig, route } from "@react-router/dev/routes";

export default [
  index("pages/_index.tsx"),
  route("*", "pages/NotFound/NotFound.tsx"),
] satisfies RouteConfig;
