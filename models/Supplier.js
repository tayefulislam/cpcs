const mongoose = require("mongoose");

// Define your Order schema
const supplierSchema = new mongoose.Schema(
  {
    supplierId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
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
    supplierStatus: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);
