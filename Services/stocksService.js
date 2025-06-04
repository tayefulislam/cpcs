const { default: mongoose } = require("mongoose");
const stocksModel = require("../models/Stocks");

exports.createStocksService = async (entries) => {
  const result = await stocksModel.insertMany(entries);
  return result;
};

exports.getAllStocksService = async (req) => {
  const keyword = req?.query?.s || "";
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  const stockStatus = req?.query?.itemStatus || "";

  try {
    const pipeline = [];

    // 1. Initial search match
    if (keyword.trim()) {
      pipeline.push({
        $match: {
          $or: [
            { searchKeyWord: { $regex: new RegExp(keyword, "i") } },
            { stockOrderId: { $regex: new RegExp(keyword, "i") } },
          ],
        },
      });
    }

    // 2. Add status counts for each product (CORRECTED)
    pipeline.push({
      $lookup: {
        from: "stocks",
        let: { productId: "$productId" },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ["$productId", "$$productId"] }, // Only match by productId
            },
          },
          {
            $group: {
              _id: "$stockStatus",
              count: { $sum: 1 },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: "$count" },
              statusCounts: { $push: { k: "$_id", v: "$count" } },
            },
          },
          {
            $project: {
              _id: 0,
              total: 1,
              statusCounts: { $arrayToObject: "$statusCounts" },
            },
          },
        ],
        as: "statusInfo",
      },
    });

    // 3. Unwind and add status info to root
    pipeline.push({
      $unwind: { path: "$statusInfo", preserveNullAndEmptyArrays: true },
    });

    // 4. Population stages (remain unchanged)
    pipeline.push(
      {
        $lookup: {
          from: "suppliers",
          localField: "supplierId",
          foreignField: "_id",
          as: "supplierDetails",
        },
      },
      {
        $unwind: { path: "$supplierDetails", preserveNullAndEmptyArrays: true },
      },
      {
        $lookup: {
          from: "items",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
    );

    // 5. Status filter
    if (stockStatus.trim()) {
      pipeline.push({ $match: { stockStatus } });
    }

    // 6. Pagination stages (remain unchanged)
    const countPipeline = [...pipeline, { $count: "total" }];
    pipeline.push(
      { $sort: { _id: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    );

    const [data, totalResult] = await Promise.all([
      stocksModel.aggregate(pipeline),
      stocksModel.aggregate(countPipeline),
    ]);

    // Format response (remain unchanged)
    const total = totalResult[0]?.total || 0;
    const totalPages = Math.ceil(total / limit);

    const formattedData = data.map((item) => ({
      ...item,
      statusCounts: item.statusInfo?.statusCounts || {},
      total: item.statusInfo?.total || 0,
    }));

    return {
      success: true,
      data: formattedData,
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
exports.getAllStocksServiceTEST = async (req) => {
  const keyword = req?.query?.s || "";
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  const stockStatus = req?.query?.itemStatus || "";

  const pipeline = [];

  // 1. Search Stage (Conditional)
  if (keyword.trim()) {
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
                path: "sku",
                tokenOrder: "sequential",
              },
            },
          ],
        },
      },
    });
  }

  // 2. Common Population Stages (Always Added)
  pipeline.push(
    {
      $lookup: {
        from: "suppliers",
        localField: "supplierId",
        foreignField: "_id",
        as: "supplierDetails",
      },
    },
    { $unwind: { path: "$supplierDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "items",
        localField: "productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
  );

  // 3. Filter Stage (Conditional)
  if (stockStatus.trim()) {
    pipeline.push({ $match: { stockStatus } });
  }

  // 4. Create count pipeline first
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  // 5. Add pagination to main pipeline
  pipeline.push(
    { $sort: { _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  try {
    const [data, totalResult] = await Promise.all([
      stocksModel.aggregate(pipeline),
      stocksModel.aggregate(countPipeline),
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
};

// Search system without atach search
exports.getAllStocksServiceMain = async (req) => {
  const keyword = req?.query?.s || "";
  const page = parseInt(req?.query?.page) || 1;
  const limit = parseInt(req?.query?.limit) || 10;
  const stockStatus = req?.query?.itemStatus || "";

  console.log(keyword);

  const pipeline = [];

  // 1. Modified Search Stage using regex
  if (keyword.trim()) {
    pipeline.push({
      $match: {
        $or: [
          {
            searchKeyWord: {
              $regex: new RegExp(keyword, "i"), // Prefix search for autocomplete
            },
          },
          // Add other fields you want to search
          { stockOrderId: { $regex: new RegExp(keyword, "i") } },
        ],
      },
    });
  }

  // 2. Common Population Stages
  pipeline.push(
    {
      $lookup: {
        from: "suppliers",
        localField: "supplierId",
        foreignField: "_id",
        as: "supplierDetails",
      },
    },
    { $unwind: { path: "$supplierDetails", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "items",
        localField: "productId",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } }
  );

  // 3. Filter Stage
  if (stockStatus.trim()) {
    pipeline.push({ $match: { stockStatus } });
  }

  // 4. Create count pipeline (before pagination)
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });

  // 5. Add pagination and sorting
  pipeline.push(
    { $sort: { _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  try {
    const [data, totalResult] = await Promise.all([
      stocksModel.aggregate(pipeline),
      stocksModel.aggregate(countPipeline),
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
};

exports.getSingleStockByIdService = async (id) => {
  // Validate the ID format first
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid stock ID format");
  }

  const result = await stocksModel
    .findById(id)
    .populate("supplierId")
    .populate("productId")
    .exec();

  if (!result) {
    throw new Error("Stock not found");
  }

  return result;
};

exports.updateStockDetailsService = async (id, stockDetails) => {
  console.log(stockDetails, Date());

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid stock ID format");
  }

  const result = await stocksModel.findOneAndUpdate(
    { _id: id },
    { $set: stockDetails },
    { new: true }
  );

  if (!result) {
    throw new Error("Stock not found");
  }

  return result;
};

exports.getStockIdService = async (id) => {
  // Validate the ID format first

  const result = await stocksModel
    .find({ sku: id })
    .populate("supplierId")
    .populate("productId")
    .exec();

  if (!result) {
    throw new Error("Stock not found");
  }

  return result;
};

exports.getSingleStatusStockByIdService = async (productId) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return {
        success: false,
        message: "Invalid product ID format",
        error: "Invalid ObjectId format",
      };
    }

    const aggregationPipeline = [
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $facet: {
          statusCounts: [
            {
              $group: {
                _id: "$stockStatus",
                count: { $sum: 1 },
              },
            },
          ],
          total: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
              },
            },
          ],
        },
      },
      { $unwind: { path: "$total", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          statusCounts: 1,
          total: { $ifNull: ["$total.total", 0] },
        },
      },
    ];

    const result = await stocksModel.aggregate(aggregationPipeline);
    const aggregationResult = result[0] || { statusCounts: [], total: 0 };

    const statusCounts = aggregationResult.statusCounts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    return {
      success: true,
      data: {
        statusCounts,
        total: aggregationResult.total,
      },
    };
  } catch (error) {
    console.error("Error fetching stock status:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch stock status",
      error: error.message,
    };
  }
};
