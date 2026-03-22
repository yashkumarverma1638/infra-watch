const cron = require("node-cron");
const checkUrls = require("../services/uptimeChecker");

function startMonitorJob(io) {
  cron.schedule("*/30 * * * * *", async () => {
    console.log("Running monitoring...");
    await checkUrls(io); // pass socket instance
  });
}

module.exports = startMonitorJob;
