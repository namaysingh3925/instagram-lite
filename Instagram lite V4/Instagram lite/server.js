require("dotenv").config();

const http = require("http");

const app = require("./app");
const connectDB = require("./db");
const initSocket = require("./socket");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 5000;

async function startServer() {
  await connectDB();

  const httpServer = http.createServer(app);

  app.set("io", initSocket(httpServer));

  httpServer.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
}

startServer();
