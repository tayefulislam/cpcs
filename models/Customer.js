const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
    address: {
      type: String,
    },

    postalCode: {
      type: String,
    },
    date: {
      type: Date,
    },
    socialMedia: {
      type: String,
    },

    profileLink: {
      type: String,
    },

    role: {
      type: String,
      default: "customer",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Customer", CustomerSchema);
