// index.js (or server.js)

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cron = require("node-cron");

dotenv.config();

const UpdateDeliveryAndPaymentStatus = require("./utils/UpdateDeliveryAndPaymentStatus/UpdateDeliveryAndPaymentStatus");

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("MongoDB connected.");

    // Start the cron job (every 2 minutes)
    cron.schedule("*/2 * * * *", () => {
      console.log("Running UpdateDeliveryAndPaymentStatus job...");
      UpdateDeliveryAndPaymentStatus().catch((err) =>
        console.error("Error in UpdateDeliveryAndPaymentStatus:", err)
      );
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

// Optional: graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing MongoDB connection...");
  await mongoose.disconnect();
  process.exit(0);
});
