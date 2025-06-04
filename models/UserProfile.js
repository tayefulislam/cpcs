const mongoose = require("mongoose");

// Define your Order schema
const userProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
    },
    address: {
      type: String,
    },
    details: {
      type: String,
    },
    comment: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    searchKeyWord: {
      type: String,
    },
    profileStatus: {
      type: String,
      default: "Active",
    },
    role: {
      type: String,
      default: "Staff",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserProfile", userProfileSchema);
