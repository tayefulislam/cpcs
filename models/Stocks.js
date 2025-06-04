const mongoose = require("mongoose");

// Define your Order schema
const StocksSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Items",
      required: true,
    },
    stockOrderId: {
      type: String,
      required: true,
    },
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Supplier",
    },
    searchKeyWord: {
      type: String,
      required: true,
    },

    processor: {
      type: String,
    },
    gen: {
      type: String,
    },
    imei: {
      type: String,
    },

    color: {
      type: String,
    },
    ram: {
      type: String,
    },
    storage2: {
      type: String,
    },
    storage: {
      type: String,
    },
    readyRam: {
      type: String,
    },
    readyStorage: {
      type: String,
    },
    readyStorage2: {
      type: String,
    },
    size: {
      type: String,
    },

    description: {
      type: String,
    },
    comments: {
      type: Array,
    },
    trackingNumber: {
      type: String,
    },
    purchasePrice: {
      type: String,
    },
    date: {
      type: String,
    },
    sellingPrice: {
      type: String,
    },
    itemType: {
      type: String,
    },
    stockStatus: {
      type: String,
      default: "NOT_READY",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Stocks", StocksSchema);
