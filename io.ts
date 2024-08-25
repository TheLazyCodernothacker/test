import { Server } from "socket.io";
// @ts-ignore
import User from "./models/user";
// @ts-ignore

import Chat from "./models/chat";

import { ChatType, MessageType, UserClientType, UserType } from "./types";

interface connectedUser {
  [key: string]: string;
}
let connectedUsers: connectedUser = {};

const createIOServer = (server: any) => {
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

    socket.on(
      "message",
      async (data: {
        message: string;
        id: string;
        chatId: string;
        handle: string;
      }) => {
        const { message, id, chatId, handle } = data;
        const user: UserClientType = await User.findById(id);
        if (!user) {
          return;
        }
        const chat: ChatType = await Chat.findById(chatId);
        if (!chat) {
          return;
        }
        console.log(user);

        chat.messages.push({
          sender: {
            username: user.username,
            _id: user._id,
            image: user.image || "",
            handle: user.handle,
            groupchats: user.groupchats,
            info: user.info,
            auth0Id: user.auth0Id,
            message: "",
          },
          content: message,
          timestamp: new Date().toISOString(),
        });
        const messagesender = user.username;
        chat.users.forEach((user: UserType) => {
          if (
            connectedUsers[user._id.toString()] &&
            user._id.toString() !== id
          ) {
            console.log(
              "sending message to " + connectedUsers[user._id],
              socket.id
            );

            io.to(connectedUsers[user._id]).emit("message", {
              chatId,
              name: messagesender,
              message,
              handle,
            });
          }
        });
        // @ts-ignore
        chat.markModified("messages");
        await chat.save();
      }
    );

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
      for (let handle of users) {
        let founduser = await User.findOne({ handle });
        if (founduser) {
          if (!chat.users.includes((a: UserType) => a._id === founduser._id)) {
            addUser = true;
            console.log("adding user to chat");
            chat.users.push(founduser);
            founduser.groupchats.push(chat._id);
            console.log(founduser.groupchats);
            await founduser.save();
          }
        } else {
          missedUsers.push(handle);
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
};

export default createIOServer;
