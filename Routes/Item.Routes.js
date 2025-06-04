const express = require("express");
const router = express.Router();

const itemHandleController = require("../Controllers/ItemController");

router
  .route("/createNewItem")
  .post(itemHandleController.createNewItemController);

router.route("/getAllItems").get(itemHandleController.getAllItemController);

router
  .route("/getSingleItem/:productId")
  .get(itemHandleController.getSingleItemByIdController);

router
  .route("/getProductAndStockStatus/:productId")
  .get(itemHandleController.getItemAndStockStatusByIdController);

router
  .route("/updateProductDetails/:productId")
  .put(itemHandleController.updateProductDetailsController);

module.exports = router;
