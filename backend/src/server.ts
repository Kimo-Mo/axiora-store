import app from "./app.js";
import { env } from "./config/env.js";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Axiora backend listening on port ${env.PORT} (${env.NODE_ENV})`);
});

function shutdown(signal: NodeJS.Signals): void {
  // eslint-disable-next-line no-console
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close((err) => {
    if (err) {
      // eslint-disable-next-line no-console
      console.error("Error during shutdown", err);
      process.exit(1);
    }
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

export default server;
