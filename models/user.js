const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  password: {
    required: true,
    type: String,
  },
  groupchats: {
    type: Array,
    default: [],
  },
});

module.exports = mongoose.model("FeatherChatUser", userSchema);
