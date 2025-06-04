const mongoose = require("mongoose");

// Define your Order schema
const itemSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
    },
    brand: {
      type: String,
      required: true,
    },
    productId: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
    },

    details: {
      type: String,
    },
    comment: {
      type: String,
    },

    sellingPrice: {
      type: String,
    },
    sellingDetails: {
      type: String,
    },
    purchasePrice: {
      type: String,
    },
    itemType: {
      type: String,
    },
    model: {
      type: String,
    },
    searchKeyWord: {
      type: String,
    },

    itemStatus: {
      type: String,
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Items", itemSchema);
