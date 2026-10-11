import app from "./app.js";
import { env } from "./config/env.js";
import { startPaymentExpiryJob } from "./modules/payments/expiry-job.js";

const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Axiora backend listening on port ${env.PORT} (${env.NODE_ENV})`);
  // Abandoned online payments are swept by an in-process interval (research D-6).
  // Started on `listen` rather than at import so importing this module — for a
  // script, or a type check — never leaves a timer running; it is also idempotent,
  // so a dev-watch reload cannot accumulate two sweeps.
  startPaymentExpiryJob();
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

/**
 * A rejection that reaches here escaped the Express error pipeline. It is a bug,
 * but one bug must not take the whole server down and drop every other customer's
 * session. Log it loudly and keep serving; route handlers are wrapped in
 * `asyncHandler`, so this is a backstop rather than the primary mechanism.
 */
process.on("unhandledRejection", (reason) => {
  // eslint-disable-next-line no-console
  console.error("[unhandledRejection]", reason);
});

process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("[uncaughtException]", err);
  // State may be inconsistent after an uncaught exception, so exit deliberately
  // rather than limp on. `tsx watch` restarts the process automatically.
  process.exit(1);
});

export default server;
