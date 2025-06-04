const {
  createNewDuePaymentService,
  getAllDuePaymentsService,
} = require("../Services/DuePaymentsService");

// Create New Due Payment
exports.createNewDuePaymentController = async (req, res, next) => {
  try {
    const duePayment = req.body;
    const result = await createNewDuePaymentService(duePayment);
    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Create New Due Payment Record Failed",
      error: error.message,
    });
  }
};

exports.getAllDuePaymentsController = async (req, res, next) => {
  try {
    const result = await getAllDuePaymentsService(req);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Payments Failed",
      error: error.message,
    });
  }
};
