const DuePayments = require("../models/DuePayments");

exports.createNewDuePaymentService = async (payment) => {
  // console.log(payment);
  const result = await DuePayments.create(payment);

  // console.log(result);
  return result;
};

exports.getAllDuePaymentsService = async (req) => {
  const keyword = req?.query?.s || "";
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;

  const pipeline = [];

  // 1.Search Stage using regex
  if (keyword.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            searchKeyWord: {
              $regex: new RegExp(keyword, "i"), // Prefix search for autocomplete
            },
          },
        ],
      },
    });
  }

  // 4. Create count pipeline (before pagination)
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  //  Create sum pipeline for paymentAmount
  const sumPipeline = [
    ...pipeline,
    {
      $addFields: {
        // Convert paymentAmount from string to number
        paymentAmountNumeric: { $toDouble: "$paymentAmount" },
      },
    },
    {
      $group: {
        _id: null,
        totalPaymentAmount: { $sum: "$paymentAmountNumeric" },
      },
    },
  ];

  // 5. Add pagination and sorting
  pipeline.push(
    { $sort: { _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  try {
    const [data, totalResult, sumResult] = await Promise.all([
      DuePayments.aggregate(pipeline),
      DuePayments.aggregate(countPipeline),
      DuePayments.aggregate(sumPipeline),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const totalPaymentAmount = sumResult[0]?.totalPaymentAmount || 0;

    return {
      success: true,
      data,
      totalPaymentAmount,
      pagination: {
        currentPage: page,
        previousPage: page > 1 ? page - 1 : null,
        nextPage: page < totalPages ? page + 1 : null,
        totalPages,
        totalDocuments: total,
        limit,
      },
    };
  } catch (error) {
    console.error("Error fetching Due Payments", error);
    return {
      success: false,
      message: "Failed to fetch Suppiller Payments Data",
      error: error.message,
    };
  }
};
