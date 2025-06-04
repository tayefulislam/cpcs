const paymentModel = require("../models/Payments");

exports.createNewPaymentService = async (payment) => {
  // console.log(payment);
  const result = await paymentModel.create(payment);

  // console.log(result);
  return result;
};

exports.updatePaymentDetailsService = async (id, payment) => {
  // console.log(payment);

  const result = await paymentModel.findOneAndUpdate(
    { _id: id },
    { $set: payment },
    { new: true }
  );

  return result;
};

exports.updatePaymentIfPaymentPaid = async (id, payment) => {
  const result = await paymentModel.findOneAndUpdate(
    { _id: id },
    { paymentStatus: "Paid" }
  );

  return result;
};
