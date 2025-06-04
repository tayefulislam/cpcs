const express = require("express");

const router = express.Router();

const stockOrderHandleController = require("../Controllers/StockOrderController");

router
  .route("/createNewStockOrder")
  .post(stockOrderHandleController.createNewStockOrderController);

router
  .route("/getAllStockOrders")
  .get(stockOrderHandleController.getAllStockOrderController);
router
  .route("/getStockOrderById/:id")
  .get(stockOrderHandleController.getSingleStockOrderByIdController);

module.exports = router;
