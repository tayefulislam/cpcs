const supplierModel = require("../models/Supplier");

exports.createNewSupplierService = async (supplier) => {
  const result = await supplierModel.create(supplier);
  return result;
};

exports.getAllSupplierService = async () => {
  //   const result = await supplierModel.find({ supplierStatus: "Active" });
  const result = await supplierModel.find({});
  return result;
};

exports.getSupplierByIdService = async (id) => {
  console.log(id);
  const result = await supplierModel.findById({ _id: id });
  return result;
};
