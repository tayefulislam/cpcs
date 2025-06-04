const OrderModel = require("../models/Order");
const PaymentModel = require("../models/Payments");
const {
  createNewCustomerService,
  updateCustomerDetailsByIdService,
} = require("../Services/CustomerService");
const {
  createNewOrderService,
  getAllOrderDetailsService,
  getSingleOrderWithCustomerPaymentDetailsService,
  updateOrderDetailsService,
  getOrderTotalAmountByStatusService,
  getPreOrderCountService,
  getAllPreOrderService,
} = require("../Services/OrderService");

const {
  createNewPaymentService,
  updatePaymentDetailsService,
} = require("../Services/PaymentsService");

// Create Order with Customer and Payment Details
exports.createNewOrderController = async (req, res, next) => {
  try {
    const newRequest = req.body;

    const customer = newRequest.customerDetails;
    const payment = newRequest.paymentDetails;

    const getOrderDocumentsSize = await OrderModel.countDocuments();
    const getPaymentDocumentsSize = await PaymentModel.countDocuments();
    // console.log(payment);

    // This will create a new order id increase by depand on dorder doucment size BSJ002451
    let newOrderId = `BSJ${String(getOrderDocumentsSize).padStart(6, "0")}`;

    // This will create a new payment id increase by depand on dorder doucment size PAY002451
    let newPaymentId = `PAY${String(getPaymentDocumentsSize).padStart(6, "0")}`;

    // DUPLICATE ORDER ID CHECK
    // let getLastOrder = await Order.find()
    //   .sort({ _id: -1 })
    //   .select("orderId")
    //   .limit(1);

    // console.log("Hello", getLastOrder[0].orderId);

    // // IF THE ORDER ID IS DUPLICATE THEN CREATE A NEW ORDER ID
    // if (getLastOrder[0].orderId === newOrderId) {
    //   newOrderId = `BSJA${String(getOrderDocumentsSize + 3 + "D").padStart(5, "0")}`;
    // }

    // // Fist Create Customer and get the details
    const createNewCustomerResult = await createNewCustomerService(customer);

    // Create New payment and get details
    payment.paymentId = newPaymentId;
    payment.customerId = createNewCustomerResult._id;
    payment.orderId = newOrderId;

    // console.log(payment);

    const createNewPayment = await createNewPaymentService(payment);

    // inject the customer id , payment id and order id
    const newOrder = newRequest.orderDetails;
    newOrder.customerId = createNewCustomerResult._id;
    newOrder.paymentObjId = createNewPayment._id;
    newOrder.orderId = newOrderId;
    newOrder.paymentId = newPaymentId;

    // Create New Order and get the details
    const createNewOrderResult = await createNewOrderService(newOrder);
    // console.log(createNewOrderResult);

    const result = createNewOrderResult;

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "New Order Create Failed",
      error: error.message,
    });
  }
};

// GET ALL ORDER DETAILS
exports.getAllOrderDetailsController = async (req, res, next) => {
  // console.log("checked");

  try {
    const result = await getAllOrderDetailsService(req);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Order Details Failed",
      error: error.message,
    });
  }
};

// GET Single ORDER DETAILS BY ID WITH CUSTOMER AND PAYMENT DETAILS

exports.getSingleOrderWithCustomerPaymentDetailsController = async (
  req,
  res,
  next
) => {
  const id = req.params.orderId;

  // console.log(id);

  try {
    const result = await getSingleOrderWithCustomerPaymentDetailsService(id);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get Single Order With ",
      error: error.message,
    });
  }
};

// UPDATE ORDER DETAILS WITH CUSTOMER AND PAYMENT

exports.updateOrderDetailsController = async (req, res, next) => {
  try {
    const reqCheck = req.body;
    // console.log(reqCheck);

    if (reqCheck.customerDetails) {
    }
    const orderResult = await updateOrderDetailsService(
      reqCheck.orderId,
      reqCheck.orderDetails
    );

    const paymentResult = await updatePaymentDetailsService(
      reqCheck.paymentObjId,
      reqCheck.paymentDetails
    );

    const customerResult = await updateCustomerDetailsByIdService(
      reqCheck.customerId,
      reqCheck.customerDetails
    );

    // console.log(customerResult, orderResult, paymentResult);

    res.status(200).send(customerResult, orderResult, paymentResult);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Update Order Details Failed",
      error: error.message,
    });
  }
};

// GET // get order total amount by status

exports.getOrderTotalAmountByStatusController = async (req, res, next) => {
  try {
    const { startDate, endDate } = req?.query;

    const statusOrder = await getOrderTotalAmountByStatusService(
      startDate,
      endDate
    );
    let preOrder = await getPreOrderCountService();

    const data = { statusOrder, preOrder };
    // console.log(data);

    res.status(200).send(data);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get Order Total Amount By Status Failed",
      error: error.message,
    });
  }
};

// // UPDATE DELIVERY DATE if delivered
// exports.updateDeliveryDate = async (req, res) => {
//   try {
//     const orderId = req.params.orderId;
//     const deliveryDate = req.body.deliveryDate;
//     const result = await updateDeliveryDateService(orderId, deliveryDate);
//     res.status(200).send(result);
//   } catch (error) {
//     res.status(400).json({
//       status: "failed",
//       message: "Update Delivery Date Failed",
//       error: error.message,
//     });
//   }
// };
