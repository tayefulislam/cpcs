const cron = require("node-cron");
// const path = require("path");
const express = require("express");

const app = express();
const cors = require("cors");
app.use(express.json());
app.use(cors());

// UpdateDeliveryAndPaymentStatus
const UpdateDeliveryAndPaymentStatus = require("./utils/UpdateDeliveryAndPaymentStatus/UpdateDeliveryAndPaymentStatus");

//Schedule the function to run at the top of every hour
UpdateDeliveryAndPaymentStatus();
cron.schedule("*/5 * * * *", () => {
  UpdateDeliveryAndPaymentStatus();
});

const orderRequestRoute = require("./Routes/Order.Routes");
const customerRequestRoute = require("./Routes/Customer.Routes");
const supplierRequestRoute = require("./Routes/Supplier.Routes");
const itemRequestRoute = require("./Routes/Item.Routes");
const stockOrderRequestRoute = require("./Routes/StockOrder.Routes");
const stocks = require("./Routes/Stock.Routes");
const duePaymentsRoute = require("./Routes/DuePayments.Routes");
const userRoute = require("./Routes/UserProfile.Routes");

app.get("/", (req, res) => {
  res.send("AWS API");
});

// Define a route to serve the PDF file
// app.get("/pdfs/:fileName", (req, res) => {
//   console.log("hello");
//   const fileName = req.params.fileName;
//   const directory = path.join(__dirname, "pdfs");
//   const filePath = path.join(directory, fileName);

//   res.sendFile(filePath, (err) => {
//     if (err) {
//       console.error("Error sending file:", err);
//       res.status(404).send("File not found");
//     }
//   });
// });

app.use("/api/v1/orders", orderRequestRoute);
app.use("/api/v1/customer", customerRequestRoute);
app.use("/api/v1/supplier", supplierRequestRoute);
app.use("/api/v1/item", itemRequestRoute);
app.use("/api/v1/stockOrder", stockOrderRequestRoute);
app.use("/api/v1/stocks", stocks);
app.use("/api/v1/duePayments", duePaymentsRoute);
app.use("/api/v1/userRoute", userRoute);

module.exports = app;
