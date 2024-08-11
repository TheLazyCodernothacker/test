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
  info: {
    type: String,
    required: true,
    default: "I'm an NPC and haven't added an interesting info yet.",
  },
});

module.exports = mongoose.model("FeatherChatUser", userSchema);
