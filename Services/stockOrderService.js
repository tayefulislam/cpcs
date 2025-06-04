const stockOrderModel = require("../models/StockOrder");

exports.createStockOrderService = async (stockOrder) => {
  const result = await stockOrderModel.create(stockOrder);
  return result;
};

// Search system without atach search
exports.getAllStockOrderService = async (req) => {
  const keyword = req?.query?.s || "";
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;

  const pipeline = [];

  // 1. Modified Search Stage using $regex
  if (keyword.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            searchKeyWord: {
              $regex: new RegExp(keyword, "i"), // Case-insensitive regex search
            },
          },
          // Add other fields you want to search
          { stockOrderId: { $regex: new RegExp(keyword, "i") } },
        ],
      },
    });
  }

  // 2. Common Population Stages (Uncomment if needed)
  // pipeline.push(...);

  // 3. Count pipeline (needs to be created before pagination stages)
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  //  Create sum pipeline for totalPurchasePrice
  const sumPipeline = [
    ...pipeline,
    {
      $addFields: {
        // Convert string to numeric
        totalPurchasePriceNumeric: { $toDouble: "$totalPurchasePrice" },
      },
    },
    {
      $group: {
        _id: null,
        totalPurchasePrice: { $sum: "$totalPurchasePriceNumeric" },
      },
    },
  ];

  // 4. Add pagination
  pipeline.push(
    { $sort: { _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  try {
    const [data, totalResult, totalPurchasePrice] = await Promise.all([
      stockOrderModel.aggregate(pipeline),
      stockOrderModel.aggregate(countPipeline),
      stockOrderModel.aggregate(sumPipeline),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const totalPurchaseAmount = totalPurchasePrice[0]?.totalPurchasePrice || 0;

    return {
      success: true,
      data,
      totalPurchaseAmount,
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
    console.error("Error fetching stocks:", error);
    return {
      success: false,
      message: "Failed to fetch stocks data",
      error: error.message,
    };
  }
};

// Search System with autocomplete
exports.getAllStockOrderServiceTest = async (req) => {
  const keyword = req?.query?.s || "";
  console.log(keyword);
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;

  const pipeline = [];

  // 1. Search Stage (Conditional)
  if (keyword.trim()) {
    pipeline.push({
      $search: {
        index: "default", // or your actual index name
        compound: {
          should: [
            {
              autocomplete: {
                query: keyword,
                path: "searchKeyWord",
              },
            },
          ],
        },
      },
    });
  }

  // 2. Common Population Stages (Always Added)
  // pipeline.push(
  //   {
  //     $lookup: {
  //       from: "suppliers",
  //       localField: "supplierId",
  //       foreignField: "_id",
  //       as: "supplierDetails",
  //     },
  //   },
  //   { $unwind: { path: "$supplierDetails", preserveNullAndEmptyArrays: true } },
  //   {
  //     $lookup: {
  //       from: "items",
  //       localField: "productId",
  //       foreignField: "_id",
  //       as: "productDetails",
  //     },
  //   },
  //   { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
  // );

  // 3. Filter Stage (Conditional)
  // if (stockStatus.trim()) {
  //   pipeline.push({ $match: { stockStatus } });
  // }

  // 4. Create count pipeline first
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  // 5. Add pagination to main pipeline
  pipeline.push({ $skip: (page - 1) * limit }, { $limit: limit });

  try {
    const [data, totalResult] = await Promise.all([
      stockOrderModel.aggregate(pipeline),
      stockOrderModel.aggregate(countPipeline),
    ]);

    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      success: true,
      data,
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
    console.error("Error fetching stocks:", error);
    return {
      success: false,
      message: "Failed to fetch stocks data",
      error: error.message,
    };
  }

  const result = await stockOrderModel.find({}).sort({ _id: -1 });
  return result;
};

exports.getSingleStockOrderByIdService = async (id) => {
  console.log("getSingleStockOrderByIdService" + id);
  const result = await stockOrderModel
    .findById({ _id: id })
    .populate("productId")
    .populate("supplierId");
  return result;
};
