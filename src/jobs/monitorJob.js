const cron = require("node-cron");
const checkUrls = require("../services/uptimeChecker");

cron.schedule("*/30 * * * * *", () => {
  console.log("Running monitoring...");
  checkUrls();
});
