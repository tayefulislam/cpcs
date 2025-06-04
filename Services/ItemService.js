const itemModel = require("../models/Item");

mongoose = require("mongoose");
const stocksModel = require("../models/Stocks");

exports.createNewItemService = async (item) => {
  // console.log(item);
  const result = await itemModel.create(item);
  return result;
};

exports.getAllItemService = async (req) => {
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

  // 5. Add pagination and sorting
  pipeline.push(
    { $sort: { _id: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit }
  );

  try {
    const [data, totalResult] = await Promise.all([
      itemModel.aggregate(pipeline),
      itemModel.aggregate(countPipeline),
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

exports.getItemByIdService = async (id) => {
  console.log(id);
  const result = await itemModel.findById({ _id: id });
  return result;
};

exports.getItemAndStockStatusByIdService = async (productId) => {
  try {
    // Validate and convert to ObjectId
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("Invalid productId format");
    }
    const productObjectId = new mongoose.Types.ObjectId(productId);

    const pipeline = [
      // Stage 1: Filter documents by productId
      {
        $match: {
          productId: productObjectId,
        },
      },

      // Stage 2: Group by stockStatus to get counts
      {
        $group: {
          _id: "$stockStatus",
          count: { $sum: 1 },
        },
      },

      // Stage 3: Create array of status objects
      {
        $project: {
          _id: 0,
          status: "$_id",
          count: 1,
        },
      },

      // Stage 4: Group all results to get total and status array
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$count" },
          stockStatus: { $push: { status: "$status", count: "$count" } },
        },
      },

      // Stage 5: Final projection to clean up output
      {
        $project: {
          _id: 0,
          totalStock: 1,
          stockStatus: 1,
        },
      },
    ];

    const result = (await stocksModel.aggregate(pipeline))[0] || {};

    const details = await itemModel.findById({ _id: productId });

    // Handle case with no matching stocks
    if (result.length === 0) {
      return {
        totalStock: 0,
        stockStatus: [],
      };
    }

    result.productDetails = details;

    return result;
  } catch (error) {
    console.error("Error in getStockStatusByProductId:", error.message);
    throw error;
  }
};

exports.updateProductDetailsService = async (id, product) => {
  console.log("Update product details with id:", id);
  console.log("Update product details with data:", product);

  const result = await itemModel.findOneAndUpdate(
    { _id: id },
    { $set: product }
  );
  // console.log("Result user with email:", result);

  return result;
};
