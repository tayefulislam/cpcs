const axios = require("axios");
const cheerio = require("cheerio");
const moment = require("moment-timezone");

const orderModel = require("../../models/Order");

const { updateDeliveryStatusService } = require("../../Services/OrderService");
const {
  updatePaymentDetailsService,
  updatePaymentIfPaymentPaid,
} = require("../../Services/PaymentsService");

async function UpdateDeliveryStatus(
  item,
  status,
  date,
  paymentStatus,
  paymentId
) {
  // console.log("order Id", item._id, status);

  if (paymentStatus === "Paid") {
    await updatePaymentIfPaymentPaid(paymentId);
  }

  const result = await updateDeliveryStatusService(item._id, status, date);

  // console.log(result);
}

async function UpdateDeliveryAndPaymentStatus() {
  const result = await orderModel
    .find(
      { deliveryStatus: { $nin: ["Cancelled", "Delivered", "Returned"] } },
      "_id"
    )
    .populate({
      path: "paymentObjId",
      select: "courierName trackId",
    })
    .exec();

  result?.map((item) => {
    if (item.paymentObjId.trackId) {
      let status;
      let deliveryDate;
      let paymentStatus;

      let trackId = item?.paymentObjId?.trackId;
      let paymentId = item?.paymentObjId._id;
      console.log(paymentId);

      const url = `https://trackings.post.japanpost.jp/services/srv/search/direct?reqCodeNo1=${trackId}&searchKind=S002&locale=en`;

      // console.log(url);

      // const url = `https://trackings.post.japanpost.jp/services/sp/srv/search?requestNo1=${trackId}&search=Beginning&locale=en`;

      axios
        .get(url)
        .then((response) => {
          const html = response.data;
          let $ = cheerio.load(html);

          // Example: Extracting all paragraph text
          // japan post
          let content = $("td")
            .map((i, el) => $(el).text())
            .get()
            .join("\n");

          // new code

          if (content) {
            // Check Return

            if (content.lastIndexOf("Returned to sender") > 1) {
              // console.log("Returned to sender");
              // console.log(content.lastIndexOf("Returned to sender"));

              status = "Returned";
              // saveWebsiteAsPDF(url, path.join(directory, `${trackId}.pdf`));

              content = "";
              deliveryDate = "";
            }

            // Check Returning Back

            if (content.lastIndexOf("Returned to Sender") > 1) {
              console.log("Returned to Sender");
              console.log(content.lastIndexOf("Returned to Sender"));

              status = "Returning Back";
              // saveWebsiteAsPDF(url, path.join(directory, `${trackId}.pdf`));

              content = "";
            }

            // Check Final Delivery

            if (content.lastIndexOf("Final delivery") > 1) {
              // console.log("Final delivery");
              // console.log(content.lastIndexOf("Final delivery"));
              status = "Delivered";
              paymentStatus = "Paid";

              const getDeliveryTime = content.slice(
                content.lastIndexOf("Final delivery") - 17,
                content.lastIndexOf("Final delivery")
              );

              const jstDate = moment.tz(
                getDeliveryTime,
                "MM/DD/YYYY HH:mm",
                "Asia/Tokyo"
              );

              deliveryDate = jstDate.format();
              // console.log("paymentStatus", paymentStatus);
              // saveWebsiteAsPDF(url, path.join(directory, `${trackId}.pdf`));
              content = "";
            }

            if (content.lastIndexOf("Allocated to delivery staff") > 1) {
              // console.log("Allocated to delivery staff");
              // console.log(content.lastIndexOf("Allocated to delivery staff"));
              status = "Out for delivery";
              // saveWebsiteAsPDF(url, path.join(directory, `${trackId}.pdf`));
              content = "";
              deliveryDate = "";
              paymentStatus = "";
            }

            // Check Redelivery Status

            if (
              content.lastIndexOf("A request for re-delivery was received") >
              content.lastIndexOf("Absence. Attempted delivery.")
            ) {
              // console.log("A request for re-delivery was received ");
              // console.log(
              //   content.lastIndexOf("A request for re-delivery was received")
              // );
              status = "Redelivery Done";
              content = "";
              paymentStatus = "";
              deliveryDate = "";
            }

            // if (content.lastIndexOf("A request for re-delivery was received") > 1) {
            //   console.log("A request for re-delivery was received ");
            //   console.log(
            //     content.lastIndexOf("A request for re-delivery was received")
            //   );
            //   status = "Redelivery Done";
            //   content = "";
            // }

            // Check Absence

            if (content.lastIndexOf("Absence. Attempted delivery.") > 1) {
              // console.log("Absence. Attempted delivery.");
              // console.log(content.lastIndexOf("Absence. Attempted delivery."));
              status = "Absence";
              content = "";
              paymentStatus = "";
              deliveryDate = "";
            }

            // Check Investigation ( Normal Happend When address is incorret or Reject the Item)

            if (content.lastIndexOf("Investigation") > 1) {
              // console.log("Investigation");
              // console.log(content.lastIndexOf("Investigation"));
              status = "Investigation";
              content = "";
              paymentStatus = "";
              deliveryDate = "";
            }

            if (content.lastIndexOf("Processing at delivery Post Office") > 1) {
              // console.log("Processing at delivery Post Office");
              // console.log(
              //   content.lastIndexOf("Processing at delivery Post Office")
              // );
              status = "Reached Post Office";
              content = "";
              deliveryDate = "";
              paymentStatus = "";
            }

            // Check Out From Post office or not

            if (content.lastIndexOf("En route") > 1) {
              // console.log("En route");
              // console.log(content.lastIndexOf("En route"));
              status = "En route";
              content = "";
              deliveryDate = "";
              paymentStatus = "";
            }

            //

            if (content.indexOf("Posting/Collection") > 1) {
              // console.log("Posting/Collection");
              // console.log(content.indexOf("Posting/Collection"));
              status = "Post Office Drop";
              content = "";
              deliveryDate = "";
              paymentStatus = "";
            }

            //
          }

          {
            status: UpdateDeliveryStatus(
              item,
              status,
              deliveryDate,
              paymentStatus,
              paymentId
            );
          }

          // console.log(status);
        })
        .catch((error) => {
          console.error(`Error fetching the URL: ${error}`);
        });
    }
  });
}

module.exports = UpdateDeliveryAndPaymentStatus;
