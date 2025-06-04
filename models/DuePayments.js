const mongoose = require("mongoose");

// Define your Order schema
const duePaymentsSchema = new mongoose.Schema(
  {
    sId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    duePaymentId: {
      type: String,
    },
    supplierId: {
      type: String,
    },
    supplierName: {
      type: String,
    },

    paymentDate: {
      type: String,
    },
    paymentAmount: {
      type: String,
    },

    paymentType: {
      type: String,
    },
    bankName: {
      type: String,
    },

    transactionNumber: {
      type: String,
    },

    paymentStatus: {
      type: String,
      default: "Paid",
    },

    details: {
      type: String,
    },
    searchKeyWord: {
      type: String,
    },
    // paymentStatus: {
    //   type: String,
    //   default: "Pending",
    // },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DuePayments", duePaymentsSchema);
