const express = require("express");

const router = express.Router();

const ordersHandleController = require("../Controllers/OrderController");

router
  .route("/getAllOrderDetails")
  .get(ordersHandleController.getAllOrderDetailsController);

router
  .route("/createOrder")
  .post(ordersHandleController.createNewOrderController);

router
  .route("/getSingleOrderWithCustomerPaymentDetails/:orderId")
  .get(
    ordersHandleController.getSingleOrderWithCustomerPaymentDetailsController
  );

router
  .route("/updateOrderDetails")
  .put(ordersHandleController.updateOrderDetailsController);

router
  .route("/getOrderTotalAmountByStatus")
  .get(ordersHandleController.getOrderTotalAmountByStatusController);

module.exports = router;
