const supplierModel = require("../models/Supplier");

const {
  createNewSupplierService,
  getAllSupplierService,
  getSupplierByIdService,
} = require("../Services/SupplierService");

exports.createNewSupplierController = async (req, res, next) => {
  //   console.log("req", req.body);
  const newSuppler = req.body;

  try {
    // get Supplier Documents Size
    const getSupplierDocumentsSize = await supplierModel.countDocuments();
    // Create Supplier ID

    let newSupplierId = `SUP${String(getSupplierDocumentsSize).padStart(
      4,
      "0"
    )}`;

    newSuppler.supplierId = newSupplierId;

    console.log(newSuppler);
    const result = await createNewSupplierService(newSuppler);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Create New Supplier Failed",
      error: error.message,
    });
  }
};

exports.getAllSupplierController = async (req, res, next) => {
  try {
    const result = await getAllSupplierService();

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Supplier Failed",
      error: error.message,
    });
  }
};

exports.getSingleSupplierByIdController = async (req, res, next) => {
  const id = req.params.supplierId;
  console.log(id);
  try {
    const result = await getSupplierByIdService(id);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get Single Supplier Failed",
      error: error.message,
    });
  }
};
