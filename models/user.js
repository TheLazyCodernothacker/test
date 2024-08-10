const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    required: true,
    type: String,
  },
  auth0Id: {
    required: true,
    type: String,
  },
  groupchats: {
    type: Array,
    default: [],
  },
  handle: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("FeatherChatUser", userSchema);
