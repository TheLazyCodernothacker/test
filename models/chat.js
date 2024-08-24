const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  users: {
    type: Array,
    default: [],
  },
  messages: {
    type: Array,
    default: [],
  },
  author: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "The best chat ever",
  },
});

module.exports = mongoose.model("FeatherChatChat", chatSchema);
