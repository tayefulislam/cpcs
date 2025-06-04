const mongoose = require("mongoose");

// Define your Order schema
const orderSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    paymentObjId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payments",
      required: true,
    },
    paymentId: {
      type: String,
      required: true,
      unique: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    itemsDetails: {
      type: Array,
    },
    orderPostalCode: {
      type: String,
      trim: true,
    },
    deliveryDate: {
      type: String,
    },
    timeSlot: {
      type: String,
    },
    totalAmount: {
      type: String,
    },
    orderType: {
      type: String,
    },
    deliveryCost: {
      type: String,
    },
    deliveryStatus: {
      type: String,
      default: "Created",
    },
    searchKeyWord: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

orderSchema.index({
  orderId: "text",
  paymentId: "text",
  searchKeyWord: "text",
  "itemsDetails.itemName": "text",
});

module.exports = mongoose.model("Order", orderSchema);
