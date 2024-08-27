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
        if (!id) {
          return;
        }
        const user: UserClientType = await User.findById(id);
        if (!user) {
          return;
        }
        const chat: ChatType = await Chat.findById(chatId);
        if (!chat) {
          return;
        }

        chat.messages.push({
          sender: user._id as string,
          content: message,
          timestamp: new Date().toISOString(),
        });
        const messagesender = user;
        chat.users.forEach((user) => {
          if (connectedUsers[user._id] && user._id !== id) {
            console.log(
              "sending message to " + connectedUsers[user._id],
              socket.id
            );

            io.to(connectedUsers[user._id]).emit("message", {
              chatId,
              sender: messagesender._id,
              message,
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
      let newUsers: {
        role: "User" | "Admin" | "Owner" | "Author";
        _id: string;
      }[] = [];
      let requiredUsers: {
        [key: string]: UserClientType;
      } = {};
      let dupes: string[] = [];

      let addUser = false;
      for (let handle of users) {
        let founduser: UserType = await User.findOne({ handle });
        if (founduser) {
          if (
            !chat.users.some(
              (a: {
                _id: string;
                role: "User" | "Admin" | "Owner" | "Author";
              }) => {
                return a._id.toString() === founduser._id.toString();
              }
            )
          ) {
            addUser = true;
            console.log("adding user to chat");
            chat.users.push({ _id: founduser._id, role: "User" });
            founduser.groupchats.push(chat._id);
            newUsers.push({ _id: founduser._id, role: "User" });
            requiredUsers[founduser._id.toString()] = {
              username: founduser.username,
              _id: founduser._id,
              image: founduser.image,
              handle: founduser.handle,
              groupchats: [],
              info: founduser.info,
              auth0Id: founduser.auth0Id,
            };
            await founduser.save();
          } else {
            dupes.push(founduser.username);
          }
        } else {
          missedUsers.push(handle);
        }
      }
      chat.markModified("users");
      await chat.save();
      socket.emit(
        "usersAdded",
        addUser,
        missedUsers,
        newUsers,
        requiredUsers,
        chatId,
        dupes
      );
    });

    socket.on("disconnect", () => {
      console.log(`user disconnected ${socket.id}`);
    });
  });
};

export default createIOServer;
