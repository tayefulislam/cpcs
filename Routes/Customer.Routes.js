const express = require("express");

const router = express.Router();

const customerHandleController = require("../Controllers/CustomerController");

router
  .route("/GetSingleCustomerDetails/:CustomerId")
  .get(customerHandleController.getCustomerDetailsByIdController);

module.exports = router;
