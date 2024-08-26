import express, { Request, Response, NextFunction } from "express";
import http from "http";
import { createServer as createViteServer } from "vite";
import createIOServer from "./io";
import mongoose from "mongoose";
// @ts-ignore
import User from "./models/user";
// @ts-ignore
import Chat from "./models/chat";

import bodyParser from "body-parser";
import { auth, ConfigParams } from "express-openid-connect";
import dotenv from "dotenv";
import compression from "compression";
import {
  UserType,
  ChatType,
  MessageType,
  SessionType,
  UserClientType,
} from "./types";

// Load environment variables from .env file
dotenv.config();

const port = process.env.PORT || 5000;

let users = {};

async function createMainServer() {
  const app = express();

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: "a long, randomly-generated asdf stored in env",
    baseURL: process.env.BASE_URL,
    clientID: "cDYMVSGg1OSuLJLV8YkeM3whKvERL2OW",
    issuerBaseURL: "https://feather-chat.us.auth0.com",
    authorizationParams: {
      scope: "openid email profile", // Include 'email' in the scope
    },
  };

  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(auth(config));
  app.use(compression());

  // req.isAuthenticated is provided from the auth router
  app.get("/check", (req, res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
  });

  app.get("/logout", (req, res) => {
    res.oidc.logout();
  });

  app.use(bodyParser.json());
  app.use(async (req, res, next) => {
    if (req.oidc.isAuthenticated()) {
      const userInfo = req.oidc.user;

      try {
        // Check if the user already exists in MongoDB
        let user: UserType = await User.findOne({ auth0Id: userInfo?.sub });

        if (!user) {
          // If user does not exist, create a new user record
          let handle;
          let chars = "0123456789";
          while (true) {
            handle = "";
            for (let i = 0; i < 8; i++) {
              handle += chars.charAt(Math.floor(Math.random() * 10));
            }
            let hasHandle = await User.findOne({ handle });
            if (!hasHandle) {
              break;
            }
          }
          user = new User({
            auth0Id: userInfo?.sub, // Auth0 user ID
            username: userInfo?.nickname || userInfo?.name || userInfo?.email,
            handle,
            image: userInfo?.picture || userInfo?.image,
          });

          await user.save();
          console.log("New user created in MongoDB");
        }

        // Additional custom logic here (e.g., logging, sending welcome emails, etc.)
      } catch (error) {
        console.error("Error processing user login:", error);
      }
    }
    next(); // Proceed to the next middleware or route handler
  });
  const server = http.createServer(app);
  try {
    await mongoose.connect(
      "mongodb+srv://MaxLocke:yanjiasucks@coducationusers.8l73h11.mongodb.net/users?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }

  app.get("/api/checkSession", async (req, res) => {
    const userInfo = req.oidc.user;

    if (!req.oidc.isAuthenticated()) {
      res.json({ message: "Session not found" });
      return;
    }
    let user: UserType = await User.findOne({ auth0Id: userInfo?.sub });
    let returnData: SessionType = {
      message: "Session found",
      user: {
        username: user.username,
        _id: user._id,
        image: userInfo?.picture || userInfo?.image,
        info: user.info,
        handle: user.handle,
        auth0Id: user.auth0Id,
      },
    };
    if (user) {
      res.json(returnData);
    } else {
      res.json({ message: "Session not found" });
    }
  });

  app.post("/api/updateUser", async (req, res) => {
    const userInfo = req.oidc.user;
    if (!req.oidc.isAuthenticated()) {
      return;
    }
    const user: UserType = await User.findOne({ auth0Id: userInfo?.sub });
    if (!user) {
      res.status(400);
      res.json({ message: "User not found" });
      return;
    } else {
      let { username, info, image, handle } = req.body;
      let duplicateHandle: UserType = await User.findOne({ handle });
      if (duplicateHandle) {
        res.status(400);
        res.json({ message: "Handle already taken" });
        return;
      } else {
        user.username = username;
        user.info = info;
        user.image = image;
        user.handle = handle;
        try {
          await user.save();
          res.json({ message: "Success" });
        } catch (e) {
          console.log(e);
          res.status(500);
          res.json({ message: "Internal server error" });
        }
      }
    }
  });

  app.post("/api/createGroupChat", async (req, res) => {
    const userInfo = req.oidc.user;
    if (!req.oidc.isAuthenticated()) {
      return;
    }
    const { name } = req.body;
    let user: UserType = await User.findOne({ auth0Id: userInfo?.sub });

    if (!user) {
      res.status(400);
      res.json({ message: "User not found" });
      return;
    }
    const id = user._id;
    const foundchat: ChatType = await Chat.findOne({ name });
    if (foundchat) {
      res.status(400);
      res.json({ message: "Chat with that name already exists" });
      return;
    }
    let chat: ChatType = new Chat({
      users: [user._id],
      author: id,
      name,
    });
    chat.save().then(() => {
      console.log("Chat created");
      console.log(user.username);
      user.groupchats.push(chat._id);
      user.save().then(() => {
        res.json({ message: "Group chat created" });
      });
    });
  });

  app.get("/api/getGroupChats", async (req, res) => {
    const userInfo = req.oidc.user;
    if (!req.oidc.isAuthenticated()) {
      return;
    }
    let user: UserType = await User.findOne({ auth0Id: userInfo?.sub });
    if (!user) {
      res.status(400);
      res.json({ message: "User not found" });
      return;
    }
    let groupChats: ChatType[] = [];
    let requiredUsers: {
      [key: string]: UserClientType;
    } = {};
    for (let chat of user.groupchats) {
      let foundchat: ChatType = await Chat.findOne({ _id: chat });
      if (foundchat) {
        for (let userId of foundchat.users) {
          if (!requiredUsers[userId]) {
            const user: UserClientType = await User.findById(userId);
            requiredUsers[userId] = user;
          }
        }
        groupChats.push(foundchat);
      } else {
        user.groupchats = user.groupchats.filter((chat: any) => chat !== chat);
        await user.save();
      }
    }
    res.json({ groupChats, requiredUsers });
  });

  createIOServer(server);

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        protocol: "ws",
        // @ts-ignore
        port: "localhost",
        //if locally remove above and do: server : server
      },
    },
    appType: "spa",
  });

  app.use(vite.middlewares);

  app.use(express.static("static"));

  server.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
}

createMainServer();
