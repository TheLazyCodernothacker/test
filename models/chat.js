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
});

module.exports = mongoose.model("FeatherChatChat", chatSchema);
