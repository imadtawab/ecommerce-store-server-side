const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
  },
  addedIn: {
    type: Date,
    default: Date.now()
  },
  attributes: {
    type: Array,
    default: []
    },
  categories: {
    type: Array,
    default: []
    },
  collections: {
    type: Array,
    default: []
  },
  coupons: {
    type: Array,
    default: []
 } 
});

const users = mongoose.model("users", userSchema);

module.exports = users;
