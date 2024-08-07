const { Server } = require("socket.io");
const User = require("./models/user");
const Chat = require("./models/chat");

let connectedUsers = {};

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
        connectedUsers[id] = socket.id;
        console.log(connectedUsers);
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
        chat.users.forEach((user) => {
          if (connectedUsers[user] && user !== id) {
            console.log(
              "sending message to " + connectedUsers[user],
              socket.id
            );
            io.to(connectedUsers[user]).emit("message", {
              chatId,
              name: user.username,
              message,
            });
          }
        });
        chat.markModified("messages");
        await chat.save();
      });

      socket.on("addUserToChat", async (data) => {
        const { id, chatId, users } = data;
        const user = await User.findById(id);
        if (!user) {
          return;
        }
        const chat = await Chat.findById(chatId);
        if (!chat) {
          return;
        }
        let missedUsers = [];
        let addUser = false;
        for (username of users) {
          let founduser = await User.findOne({ username: username });
          if (founduser) {
            if (!chat.users.includes(founduser._id)) {
              addUser = true;
              console.log("adding user to chat");
              chat.users.push(founduser._id.toString());
              founduser.groupchats.push(chat._id);
              await founduser.save();
            }
          } else {
            missedUsers.push(username);
          }
        }
        chat.markModified("users");
        await chat.save();
        socket.emit("usersAdded", addUser, missedUsers);
      });

      socket.on("disconnect", () => {
        console.log(`user disconnected ${socket.id}`);
      });
    });
  },
};
