// src/server.js
import http from "http";
import app from "./app.js";
import config from "./config/config.js";
import { initRateLimiter } from "./config/rateLimiter.js";
import databaseService from "./service/databaseService.js";
import logger from "./util/logger.js";

import { initSocket } from "./config/socket.js";

// 1) Create HTTP server (required for Socket.IO)
const httpServer = http.createServer(app);

// 2) Initialize socket BEFORE listen (also fine, but this is clean + stable)
initSocket(httpServer, {
  corsOrigin: config.CORS_ORIGIN || "*",
});

// 3) Start listening
httpServer.listen(config.PORT, async () => {
  try {
    const connection = await databaseService.connect();

    logger.info("DATABASE_CONNECTION", {
      meta: { CONNECTION_NAME: connection.name },
    });

    initRateLimiter(connection);
    logger.info("RATE_LIMITER_INITIATED");

    logger.info("APPLICATION_STARTED", {
      meta: {
        PORT: config.PORT,
        SERVER_URL: config.SERVER_URL,
      },
    });
  } catch (err) {
    logger.error("APPLICATION_ERROR", { meta: err });

    httpServer.close((error) => {
      if (error) logger.error("APPLICATION_ERROR", { meta: error });
      process.exit(1);
    });
  }
});

// Optional: graceful shutdown
process.on("SIGINT", () => {
  logger.info("APPLICATION_SHUTDOWN", { meta: { signal: "SIGINT" } });

  httpServer.close(() => {
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  logger.info("APPLICATION_SHUTDOWN", { meta: { signal: "SIGTERM" } });

  httpServer.close(() => {
    process.exit(0);
  });
});
