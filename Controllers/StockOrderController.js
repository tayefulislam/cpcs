const {
  createStockOrderService,
  getAllStockOrderService,
  getSingleStockOrderByIdService,
} = require("../Services/stockOrderService");
const {
  createStocksService,
  getStockIdService,
} = require("../Services/stocksService");

exports.createNewStockOrderController = async (req, res, next) => {
  try {
    const { entries, stockOrder } = req.body;
    console.log(stockOrder);

    // const result = await createNewCustomerService(newRequest);

    const createStockOrder = await createStockOrderService(stockOrder);
    const createStocks = await createStocksService(entries);
    res.status(200).send({ createStockOrder, createStocks });
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "New Customer Create Failed",
      error: error.message,
    });
  }
};

exports.getAllStockOrderController = async (req, res, next) => {
  try {
    const result = await getAllStockOrderService(req);

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get All Orders Failed",
      error: error.message,
    });
  }
};

exports.getSingleStockOrderByIdController = async (req, res, next) => {
  const id = req.params.id;
  console.log(id);
  try {
    const result = await getSingleStockOrderByIdService(id);

    console.log(result?.stocks);

    if (Array.isArray(result?.stocks) && result.stocks.length > 0) {
      const stockObjects = await Promise.all(
        result.stocks.map((stockId) => getStockIdService(stockId))
      );
      console.log(stockObjects);
      result.stocks = stockObjects.flat();
    }

    // get stocks details

    res.status(200).send(result);
  } catch (error) {
    res.status(400).json({
      status: "failed",
      message: "Get Single Stock Order By Id Failed",
      error: error.message,
    });
  }
};
