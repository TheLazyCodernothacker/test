const express = require("express");
const http = require("http");

const { createServer: createViteServer } = require("vite");
const { createIOServer } = require("./io");
const mongoose = require("mongoose");
const User = require("./models/user");
const Chat = require("./models/chat");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const port = 5000;

let users = {};

async function createMainServer() {
  const app = express();
  app.use(bodyParser.json());
  app.use(cookieParser());
  const server = http.createServer(app);
  try {
    await mongoose.connect(
      "mongodb+srv://MaxLocke:yanjiasucks@coducationusers.8l73h11.mongodb.net/users?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error(error);
  }
  app.post("/api/signup", async (req, res) => {
    const { username, password } = req.body;
    let users = await User.find();
    console.log(users);
    const user = await User.findOne({ username });

    if (user) {
      console.log("User already exists");
      res.status(400);
      res.json({ message: "User already exists" });
      return;
    }
    try {
      const user = new User({
        username,
        password,
      });
      user.save().then(() => {
        console.log("User saved");
        res.json({ message: "User saved" });
      });
    } catch (error) {
      res.status(500);
      console.error(error);
      res.json({ message: "Internal server error" });
    }
  });

  app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    console.log(user);
    if (user) {
      res.json({ message: "Logged in", id: user._id });
    } else {
      res.status(400);
      res.json({ message: "User not found" });
    }
  });

  app.post("/api/checkSession", async (req, res) => {
    const { id } = req.body;
    if (id === "none") {
      res.status(400);
      res.json({ message: "Session not found" });
      return;
    }
    let user = await User.findById(id);
    if (user) {
      res.json({ message: "Session found", user: user.username });
      users[id] = user;
    } else {
      res.status(400);
      res.json({ message: "Session not found" });
    }
  });

  app.post("/api/createGroupChat", async (req, res) => {
    const { id, name } = req.body;
    let user = await User.findById(id);
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

  app.post("/api/getGroupChats", async (req, res) => {
    const { id } = req.body;
    let user = await User.findById(id);
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
        server,
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
