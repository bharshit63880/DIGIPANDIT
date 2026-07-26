const http = require("http");
const app = require("./app");
const env = require("./config/env");
const connectDb = require("./db/connectDb");
const { initSocket } = require("./sockets");

const startServer = async () => {
  try {
    await connectDb();

    const server = http.createServer(app);
    initSocket(server);

    server.listen(env.port, () => {
      console.log(`DigiPandit backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Server bootstrap failed", error);
    process.exit(1);
  }
};

startServer();
