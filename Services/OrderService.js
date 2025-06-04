const orderModel = require("../models/Order");
const moment = require("moment-timezone");

exports.createNewOrderService = async (order) => {
  const result = await orderModel.create(order);
  return result;
};

// get all order details with customer details
// exports.getAllOrderDetailsService = async (req) => {
//   const keyword = req.query.s || ""; // Use an empty string if the keyword is not provided
//   // const keyword = encodeURIComponent(req.query.s) || ""; // Use an empty string if the keyword is not provided

//   // console.log(keyword);
//   const orderType = req.query.orderType || "";
//   const page = parseInt(req.query.page) || 1;
//   // const limit = parseInt(req.query.limit);
//   const limit = 100;
//   const deliveryStatus = req.query.deliveryStatus || "";

//   const searchQuery = [];

//   // Add the search stage only if the keyword is provided and not empty
//   if (keyword.trim()) {
//     searchQuery.push({
//       $search: {
//         index: "default", // Name of the autocomplete index created in MongoDB Atlas
//         compound: {
//           should: [
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "searchKeyWord",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "orderId",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "paymentId",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "itemsDetails.itemName",
//                 tokenOrder: "sequential",
//               },
//             },
//           ],
//         },
//       },
//     });
//   }

//   const matchStage = {};

//   if (orderType.trim()) {
//     matchStage.orderType = orderType;
//   }

//   if (deliveryStatus.trim()) {
//     matchStage.deliveryStatus = deliveryStatus;
//   }

//   if (Object.keys(matchStage).length > 0) {
//     searchQuery.push({ $match: matchStage });
//   }

//   console.log(matchStage);

//   // if (orderType.trim()) {
//   //   searchQuery.push({ $match: { orderType: orderType } });
//   // }

//   // if (deliveryStatus.trim()) {
//   //   searchQuery.push({ $match: { deliveryStatus: deliveryStatus } });
//   // }

//   // Conditionally add sorting by deliveryDate for "Pre-Order" only

//   if (orderType.trim() === "Pre-Order") {
//     searchQuery.push({ $sort: { deliveryDate: 1 } });
//   } else {
//     searchQuery.push({ $sort: { _id: -1 } });
//   }

//   // Add lookup stages to populate the referenced fields
//   searchQuery.push(
//     {
//       $lookup: {
//         from: "customers",
//         localField: "customerId",
//         foreignField: "_id",
//         as: "customerId",
//       },
//     },
//     {
//       $unwind: "$customerId",
//     },
//     {
//       $lookup: {
//         from: "payments",
//         localField: "paymentObjId",
//         foreignField: "_id",
//         as: "paymentObjId",
//       },
//     },
//     {
//       $unwind: "$paymentObjId",
//     },
//     { $skip: (page - 1) * limit },

//     { $limit: limit }
//   );

//   const result = await orderModel.aggregate(searchQuery).exec();

//   // Count documents matching the search query
//   const totalOrdersQuery = [
//     {
//       $search: {
//         index: "autocomplete",
//         compound: {
//           should: [
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "searchKeyWord",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "orderId",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "paymentId",
//                 tokenOrder: "sequential",
//               },
//             },
//             {
//               autocomplete: {
//                 query: keyword,
//                 path: "itemsDetails.itemName",
//                 tokenOrder: "sequential",
//               },
//             },
//           ],
//         },
//       },
//     },
//     {
//       $count: "total",
//     },
//   ];

//   // Add the match stage to the count query if orderType is provided

//   if (orderType.trim()) {
//     totalOrdersQuery.push({ $match: { orderType: orderType } });
//   }

//   if (deliveryStatus.trim()) {
//     totalOrdersQuery.push({ $match: { deliveryStatus: deliveryStatus } });
//   }

//   // Only perform the count query if a keyword is provided

//   // async  performCountQuery (keyword) => {
//   //   const countResult = await orderModel.aggregate(totalOrdersQuery).exec();
//   //   return countResult[0]?.total || 0;
//   // }

//   console.log("totalOrdersQuery", totalOrdersQuery);
//   const totalOrders = keyword.trim()
//     ? await orderModel.aggregate(totalOrdersQuery).exec()
//     : await orderModel.countDocuments();

//   console.log("totalOrdersQuery", totalOrdersQuery);

//   const calculation = {
//     result,
//     totalPages: Math.ceil(
//       (totalOrders[0] ? totalOrders[0].total : totalOrders) / limit
//     ),
//     currentPage: page,
//   };

//   return calculation;
// };

exports.getAllOrderDetailsService = async (req) => {
  try {
    // Input sanitization and validation
    const keyword = req.query.s?.trim() || "";
    const orderType = req.query.orderType?.trim() || "";
    const deliveryStatus = req.query.deliveryStatus?.trim() || "";
    let page = Math.max(1, parseInt(req.query.page) || 1);
    let limit = Math.min(Math.max(1, parseInt(req.query.limit) || 10), 100);

    const pipeline = [];

    // Search stage
    if (keyword) {
      pipeline.push({
        $search: {
          index: "default",
          compound: {
            should: [
              {
                autocomplete: {
                  query: keyword,
                  path: "searchKeyWord",
                  tokenOrder: "sequential",
                },
              },
              {
                autocomplete: {
                  query: keyword,
                  path: "orderId",
                  tokenOrder: "sequential",
                },
              },
              {
                autocomplete: {
                  query: keyword,
                  path: "paymentId",
                  tokenOrder: "sequential",
                },
              },
              {
                autocomplete: {
                  query: keyword,
                  path: "itemsDetails.itemName",
                  tokenOrder: "sequential",
                },
              },
            ],
          },
        },
      });
    }

    // Filter stages
    if (orderType) pipeline.push({ $match: { orderType } });
    if (deliveryStatus) pipeline.push({ $match: { deliveryStatus } });

    // Sorting
    pipeline.push({
      $sort: orderType === "Pre-Order" ? { deliveryDate: 1 } : { _id: -1 },
    });

    // Lookup stages
    pipeline.push(
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customerId",
        },
      },
      { $unwind: { path: "$customerId", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "payments",
          localField: "paymentObjId",
          foreignField: "_id",
          as: "paymentObjId",
        },
      },

      { $unwind: { path: "$paymentObjId", preserveNullAndEmptyArrays: true } }
    );

    // // Projection
    // pipeline.push({
    //   $project: {
    //     orderId: 1,
    //     orderType: 1,
    //     deliveryStatus: 1,
    //     createdAt: 1,
    //     "customerId.name": 1,
    //     "paymentObjId.status": 1,
    //     itemsDetails: 1,
    //     totalAmount: 1,
    //   },
    // });

    // Create count pipeline
    const countPipeline = [...pipeline];
    countPipeline.splice(-1, 1); // Remove projection for count
    countPipeline.push({ $count: "total" });

    // Pagination
    const paginationStage = [{ $skip: (page - 1) * limit }, { $limit: limit }];
    pipeline.push(...paginationStage);

    // Execute queries in parallel
    const [data, countResult] = await Promise.all([
      orderModel.aggregate(pipeline).exec(),
      orderModel.aggregate(countPipeline).exec(),
    ]);

    const total = countResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages,
        totalDocuments: total,
        limit,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
      },
    };
  } catch (error) {
    console.error("Order service error:", error);
    return {
      success: false,
      message: "Failed to fetch order details",
      error: "Internal server error",
    };
  }
};

exports.getAllOrderDetailsServiceTEST = async (req) => {
  const keyword = req.query.s || ""; // Use an empty string if the keyword is not provided
  // const keyword = encodeURIComponent(req.query.s) || ""; // Use an empty string if the keyword is not provided

  // console.log(keyword);
  const orderType = req.query.orderType || "";
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const deliveryStatus = req.query.deliveryStatus || "";

  const searchQuery = [];

  // Add the search stage only if the keyword is provided and not empty
  if (keyword.trim()) {
    searchQuery.push({
      $search: {
        index: "default", // Name of the autocomplete index created in MongoDB Atlas
        compound: {
          should: [
            {
              autocomplete: {
                query: keyword,
                path: "searchKeyWord",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "orderId",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "paymentId",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "itemsDetails.itemName",
                tokenOrder: "sequential",
              },
            },
          ],
        },
      },
    });
  }

  if (orderType.trim()) {
    searchQuery.push({ $match: { orderType: orderType } });
  }

  if (deliveryStatus.trim()) {
    searchQuery.push({ $match: { deliveryStatus: deliveryStatus } });
  }

  // Conditionally add sorting by deliveryDate for "Pre-Order" only

  if (orderType.trim() === "Pre-Order") {
    searchQuery.push({ $sort: { deliveryDate: 1 } });
  } else {
    searchQuery.push({ $sort: { _id: -1 } });
  }

  // Add lookup stages to populate the referenced fields
  searchQuery.push(
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customerId",
      },
    },
    {
      $unwind: "$customerId",
    },
    {
      $lookup: {
        from: "payments",
        localField: "paymentObjId",
        foreignField: "_id",
        as: "paymentObjId",
      },
    },
    {
      $unwind: "$paymentObjId",
    },
    { $skip: (page - 1) * limit },

    { $limit: limit }
  );

  const result = await orderModel.aggregate(searchQuery).exec();

  // Count documents matching the search query
  const totalOrdersQuery = [
    {
      $search: {
        index: "autocomplete",
        compound: {
          should: [
            {
              autocomplete: {
                query: keyword,
                path: "searchKeyWord",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "orderId",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "paymentId",
                tokenOrder: "sequential",
              },
            },
            {
              autocomplete: {
                query: keyword,
                path: "itemsDetails.itemName",
                tokenOrder: "sequential",
              },
            },
          ],
        },
      },
    },
    {
      $count: "total",
    },
  ];

  // Add the match stage to the count query if orderType is provided

  if (orderType.trim()) {
    totalOrdersQuery.push({ $match: { orderType: orderType } });
  }

  if (deliveryStatus.trim()) {
    totalOrdersQuery.push({ $match: { deliveryStatus: deliveryStatus } });
  }

  // Only perform the count query if a keyword is provided
  const totalOrders = keyword.trim()
    ? await orderModel.aggregate(totalOrdersQuery).exec()
    : await orderModel.countDocuments();

  const calculation = {
    result,
    totalPages: Math.ceil(
      (totalOrders[0] ? totalOrders[0].total : totalOrders) / limit
    ),
    currentPage: page,
  };

  return calculation;
};

exports.getSingleOrderWithCustomerPaymentDetailsService = async (id) => {
  const result = await orderModel
    .findById(id)
    .populate("customerId") // populate customer details
    .populate("paymentObjId") // populate payment details
    .exec();
  return result;
};

exports.updateDeliveryStatusService = async (id, status, date) => {
  if (date) {
    console.log("From updateDeliveryStatusService", date);
  }

  if (date) {
    const result = await orderModel.findByIdAndUpdate(
      id,
      { deliveryStatus: status, deliveryDate: date },
      { new: true }
    );
    return result;
  } else {
    const result = await orderModel.findByIdAndUpdate(
      id,
      { deliveryStatus: status },
      { new: true }
    );
    return result;
  }
};

exports.updateOrderDetailsService = async (id, order) => {
  // const result = await orderModel.findByIdAndUpdate(id, order, { new: true });

  const result = await orderModel.findOneAndUpdate(
    { _id: id },
    { $set: order },
    { new: true }
  );
  return result;
};

// get order total amount by status

exports.getOrderTotalAmountByStatusService = async (startDate, endDate) => {
  let aggregateQuery = [];

  const startDateStr = moment
    .tz(startDate, "YYYY-MM-DD", "Asia/Tokyo")
    .format("YYYY-MM-DDTHH:mm:ssZ");
  const endDateStr = moment
    .tz(endDate, "YYYY-MM-DD", "Asia/Tokyo")
    .endOf("day")
    .format("YYYY-MM-DDTHH:mm:ssZ");

  // console.log(startDateStr);
  // console.log(endDateStr);

  if (startDate && endDate) {
    aggregateQuery.push({
      $match: {
        deliveryDate: {
          $gte: startDateStr,
          $lte: endDateStr,
        },
      },
    });
  }

  aggregateQuery.push(
    {
      $group: {
        _id: "$deliveryStatus",
        totalAmount: {
          $sum: {
            $toInt: {
              $ifNull: [
                {
                  $convert: {
                    input: "$totalAmount",
                    to: "int",
                    onError: 0,
                    onNull: 0,
                  },
                },
                0,
              ],
            },
          },
        },
        documentCount: { $sum: 1 },
      },
    },
    {
      $project: {
        deliveryStatus: "$_id",
        _id: 0,
        totalAmount: 1,
        documentCount: 1,
      },
    }
  );

  // console.log(aggregateQuery);
  const result = await orderModel.aggregate(aggregateQuery);
  return result;
};

exports.getPreOrderCountService = async () => {
  const result = await orderModel.countDocuments({ orderType: "Pre-Order" });

  // console.log("Pre" + result);
  return result;
};
