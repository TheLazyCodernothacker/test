const { Server } = require("socket.io");
const User = require("./models/user");
const Chat = require("./models/chat");

let users = {};

module.exports = {
  createIOServer: (server) => {
    const io = new Server(server);

    const ns2 = io.of("/ns2");

    ns2.on("connection", (socket) => {
      socket.emit("message", `Welcome to ns2 ${socket.id}`);
    });

    io.on("connection", (socket) => {
      console.log(`A user connected ${socket.id}`);

      socket.on("join", (id) => {
        users[id] = socket.id;
      });

      socket.on("message", async (data) => {
        const { message, id, chatId } = data;
        const user = await User.findById(id);
        if (!user) {
          return;
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return;
        }
        chat.messages.push({
          message,
          name: user.username,
        });
        console.log(chat.users);
        chat.users.forEach((user) => {
          const userId = user.id;
          if (users[userId] && userId !== id) {
            io.to(users[userId]).emit("message", {
              chatId,
              name: user.username,
              message,
            });
          }
        });
        chat.markModified("messages");
        await chat.save();
      });

      socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
      });
    });
  },
};
