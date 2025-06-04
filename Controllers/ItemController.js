const {
  createNewItemService,
  getAllItemService,
  getItemByIdService,
  getItemAndStockStatusByIdService,
  updateProductDetailsService,
} = require("../Services/ItemService");

exports.createNewItemController = async (req, res, next) => {
  //   console.log("req", req.body);
  const newItem = req.body;
  // console.log(newItem);

  try {
    const result = await createNewItemService(newItem);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Create New Item Failed",
      error: error.message,
    });
  }
};

exports.getAllItemController = async (req, res, next) => {
  try {
    const result = await getAllItemService(req);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Item Failed",
      error: error.message,
    });
  }
};

exports.getSingleItemByIdController = async (req, res, next) => {
  const id = req.params.productId;
  console.log(id);
  try {
    const result = await getItemByIdService(id);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Item Failed",
      error: error.message,
    });
  }
};

exports.getItemAndStockStatusByIdController = async (req, res, next) => {
  const id = req.params.productId;
  console.log(id);
  try {
    const result = await getItemAndStockStatusByIdService(id);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Item Failed",
      error: error.message,
    });
  }
};
exports.updateProductDetailsController = async (req, res, next) => {
  const id = req.params.productId;
  const productDetails = req.body;
  console.log(id, productDetails);
  try {
    const result = await updateProductDetailsService(id, productDetails);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Item Failed",
      error: error.message,
    });
  }
};
