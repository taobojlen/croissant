import { drizzle } from "drizzle-orm/d1";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import {
  IttyRouter,
  IRequest as IttyRequest,
  withContent,
  json,
} from "itty-router";

import { createRequestHandler } from "react-router";

import { DatabaseContext } from "~/database/context";
import * as schema from "~/database/schema";
import { handleTestRun } from "./api/handleTestRun";

interface CloudflareEnvironment {
  DB: D1Database;
}

interface Request extends IttyRequest {
  db: DrizzleD1Database<typeof schema>;
}

// If we want to pass data from the Worker to React Router:
// declare module "react-router" {
//   export interface AppLoadContext {
//     EXAMPLE: string;
//   }
// }

function withDb(request: Request, env: CloudflareEnvironment) {
  request.db = drizzle(env.DB, { schema });
}

const reactRouterRequestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

function handleWebRequest(request: Request, env: CloudflareEnvironment) {
  const db = drizzle(env.DB, { schema });
  return DatabaseContext.run(db, () => reactRouterRequestHandler(request));
}

const router = IttyRouter();
router
  .all("*", withDb)
  .post("/api/v1/results", withContent, ({ content, db }) =>
    handleTestRun(content, db),
  )
  // fall back to React Router for all other requests
  .all("*", handleWebRequest);

export default {
  fetch: (request, ...args) => router.fetch(request, ...args).then(json),
  // .catch(error),
} satisfies ExportedHandler<CloudflareEnvironment>;
