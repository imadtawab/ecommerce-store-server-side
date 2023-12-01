const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  shoppingCard: Array,
  userId: String,
  firstName: {
    type: String,
    required: false,
  },
  lastName: {
    type: String,
    required: false,
  },
  phone: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: false,
  },
  city: {
    type: String,
    required: false,
  },
  address: {
    type: String,
    required: false,
  },
  customer_Notes: {
    type: String,
    required: false,
  },
  personal_Notes: {
    type: Array,
    required: false,
    default: []
  },
  status: {
    type: Array,
    default: [{name: "pending",addedIn: Date.now()}],
  },
  current_status: {
    type: Object,
    default: [{name: "pending",addedIn: Date.now()}]
  },
  addedIn: {
    type: Number,
    default: Date.now(),
  },
});

const orders = mongoose.model("orders", orderSchema);

module.exports = orders;
