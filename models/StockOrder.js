const mongoose = require("mongoose");

// Define your Order schema
const stockOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Items",
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Supplier",
    },
    stockOrderId: {
      type: String,
      required: true,
    },
    pId: {
      type: String,
      required: true,
    },
    sId: {
      type: String,
      required: true,
    },

    stocks: {
      type: Array,
      required: true,
    },

    details: {
      type: String,
    },
    comment: {
      type: String,
    },
    date: {
      type: String,
    },
    totalPurchasePrice: {
      type: String,
    },
    searchKeyWord: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("StockOrder", stockOrderSchema);
