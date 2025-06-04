const express = require("express");

const router = express.Router();

const duePaymentsController = require("../Controllers/DuePaymentsController");

router
  .route("/createNewDuePayment")
  .post(duePaymentsController.createNewDuePaymentController);

router
  .route("/getAllDuePayments")
  .get(duePaymentsController.getAllDuePaymentsController);

module.exports = router;
