import { buildApp } from "./app.js";
import { env } from "./config/env.js";

const app = buildApp();

const server = app.listen(env.port, () => {
  console.log(`movie-api listening on :${env.port}`);
});

function shutdown() {
  console.log("movie-api shutting down...");
  server.close(() => process.exit(0));
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
