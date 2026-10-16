const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: true
    }
  });

  io.use((socket, next) => {
    try {
      const decoded = jwt.verify(
        socket.handshake.auth.token,
        process.env.JWT_SECRET
      );

      socket.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(socket.userId);
  });

  return io;
}

module.exports = initSocket;
