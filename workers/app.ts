import { drizzle } from "drizzle-orm/d1";

import { createRequestHandler } from "react-router";

import { DatabaseContext } from "~/database/context";
import * as schema from "~/database/schema";

interface CloudflareEnvironment {
  DB: D1Database;
}

// If we want to pass data from the Worker to React Router:
// declare module "react-router" {
//   export interface AppLoadContext {
//     EXAMPLE: string;
//   }
// }

const requestHandler = createRequestHandler(
  // @ts-expect-error - virtual module provided by React Router at build time
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

export default {
  fetch(request, env) {
    const db = drizzle(env.DB, { schema });
    return DatabaseContext.run(db, () =>
      requestHandler(request, {
        // EXAMPLE: "Hello, world!"
      })
    );
  },
} satisfies ExportedHandler<CloudflareEnvironment>;
