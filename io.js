const { Server } = require("socket.io");

module.exports = {
  createIOServer: (server) => {
    const io = new Server(server);

    const ns2 = io.of("/ns2");

    ns2.on("connection", (socket) => {
      socket.emit("message", `Welcome to ns2 ${socket.id}`);
    });

    io.on("connection", (socket) => {
      console.log(`A user connected ${socket.id}`);

      socket.on("message", (msg) => {
        console.log("server got a message ", msg);

        socket.emit("message", "yoyo");
      });

      socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
      });
    });
  }
};
