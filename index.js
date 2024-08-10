const express = require("express");
const http = require("http");

const { createServer: createViteServer } = require("vite");
const { createIOServer } = require("./io");
const mongoose = require("mongoose");
const User = require("./models/user");
const Chat = require("./models/chat");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const { auth } = require("express-openid-connect");
require("dotenv").config();

const port = 5000;

let users = {};

async function createMainServer() {
  const app = express();

  const config = {
    authRequired: false,
    auth0Logout: true,
    secret: "a long, randomly-generated string stored in env",
    baseURL: process.env.BASE_URL,
    clientID: "cDYMVSGg1OSuLJLV8YkeM3whKvERL2OW",
    issuerBaseURL: "https://feather-chat.us.auth0.com",
    authorizationParams: {
      scope: "openid email profile", // Include 'email' in the scope
    },
  };

  // auth router attaches /login, /logout, and /callback routes to the baseURL
  app.use(auth(config));

  // req.isAuthenticated is provided from the auth router
  app.get("/check", (req, res) => {
    res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
  });

  app.get("/callback", (req, res) => {
    console.log("oh my skibidi");
  });

  app.get("/logout", (req, res) => {
    res.oidc.logout();
  });

  app.use(bodyParser.json());
  app.use(cookieParser());
  app.use(async (req, res, next) => {
    if (req.oidc.isAuthenticated()) {
      const userInfo = req.oidc.user;
      console.log(userInfo);

      try {
        // Check if the user already exists in MongoDB
        let user = await User.findOne({ auth0Id: userInfo.sub });

        if (!user) {
          // If user does not exist, create a new user record
          let handle;
          chars = "0123456789";
          while (true) {
            handle = "";
            for (i = 0; i < 8; i++) {
              handle += chars.charAt(Math.floor(Math.random() * 10));
            }
            let hasHandle = await User.findOne({ handle });
            if (!hasHandle) {
              break;
            }
          }
          user = new User({
            auth0Id: userInfo.sub, // Auth0 user ID
            username: userInfo.nickname || userInfo.name || userInfo.email,
            handle,
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
  // app.post("/api/signup", async (req, res) => {
  //   const { username, password } = req.body;
  //   let users = await User.find();
  //   console.log(users);
  //   const user = await User.findOne({ username });

  //   if (user) {
  //     console.log("User already exists");
  //     res.status(400);
  //     res.json({ message: "User already exists" });
  //     return;
  //   }
  //   try {
  //     const user = new User({
  //       username,
  //       password,
  //     });
  //     user.save().then(() => {
  //       console.log("User saved");
  //       res.json({ message: "User saved" });
  //     });
  //   } catch (error) {
  //     res.status(500);
  //     console.error(error);
  //     res.json({ message: "Internal server error" });
  //   }
  // });

  // app.post("/api/login", async (req, res) => {
  //   const { username, password } = req.body;
  //   const user = await User.findOne({ username, password });
  //   console.log(user);
  //   if (user) {
  //     res.json({ message: "Logged in", id: user._id });
  //   } else {
  //     res.status(400);
  //     res.json({ message: "User not found" });
  //   }
  // });

  app.get("/api/checkSession", async (req, res) => {
    const userInfo = req.oidc.user;

    if (!req.oidc.isAuthenticated()) {
      res.json({ message: "Session not found" });
      return;
    }
    let user = await User.findOne({ id: userInfo._id });
    if (user) {
      res.json({
        message: "Session found",
        user: user.username,
        id: user._id,
        image: userInfo.picture,
      });
    } else {
      res.json({ message: "Session not found" });
    }
  });

  app.post("/api/createGroupChat", async (req, res) => {
    const userInfo = req.oidc.user;
    if (!req.oidc.isAuthenticated()) {
      return;
    }
    const { name } = req.body;
    let user = await User.findOne({ auth0id: userInfo.auth0id });
    const id = user._id;
    if (!user) {
      res.status(400);
      res.json({ message: "User not found" });
      return;
    }
    const foundchat = await Chat.findOne({ name });
    if (foundchat) {
      res.status(400);
      res.json({ message: "Chat with that name already exists" });
      return;
    }
    let chat = new Chat({
      users: [id],
      author: id,
      name,
    });
    chat.save().then(() => {
      user.groupchats.push(chat._id);
      user.save().then(() => {
        res.json({ message: "Group chat created" });
      });
    });
  });

  app.get("/api/getGroupChats", async (req, res) => {
    const userInfo = req.oidc.user;
    console.log(123123);
    if (!req.oidc.isAuthenticated()) {
      return;
    }
    let user = await User.findOne({ auth0id: userInfo.auth0id });
    if (!user) {
      res.status(400);
      res.json({ message: "User not found" });
      return;
    }
    let groupChats = [];
    for (chat of user.groupchats) {
      let foundchat = await Chat.findById(chat);
      if (foundchat) {
        groupChats.push(foundchat);
      } else {
        user.groupchats = user.groupchats.filter((chat) => chat !== chat);
        await user.save();
      }
    }
    res.json({ groupChats });
  });

  createIOServer(server);

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: {
        protocol: "ws",
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
