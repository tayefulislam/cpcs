const {
  createNewCustomerService,
  getCustomerDetailsById,
} = require("../Services/CustomerService");

// Create New Customer
exports.createNewCustomerController = async (req, res, next) => {
  try {
    const newRequest = req.body;
    const result = await createNewCustomerService(newRequest);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "New Customer Create Failed",
      error: error.message,
    });
  }
};

// Get Customer by Id
exports.getCustomerDetailsByIdController = async (req, res, next) => {
  try {
    const id = req.params.CustomerId;
    // console.log(id);

    const result = await getCustomerDetailsById(id);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get Customer Details Failed",
      error: error.message,
    });
  }
};

// update details status by id

// exports.updateDeliveryStatusController = async (req, res, next) => {
//   try {
//     const id = req.params.CustomerId;
//     const status = req.body.status;
//     const result = await updateDeliveryStatusService(id, status);
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: "Update Delivery Status Failed",
//       error: error.message,
//     });
//   }
// };
