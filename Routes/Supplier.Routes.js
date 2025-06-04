const express = require("express");

const router = express.Router();

const supplierHandleController = require("../Controllers/SupplierController");

router
  .route("/createNewSupplier")
  .post(supplierHandleController.createNewSupplierController);

router
  .route("/getAllSupplier")
  .get(supplierHandleController.getAllSupplierController);

router
  .route("/getSupplierById/:supplierId")
  .get(supplierHandleController.getSingleSupplierByIdController);

module.exports = router;
