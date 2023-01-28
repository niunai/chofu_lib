import * as path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import * as dotenv from "dotenv";
dotenv.config();

const options = {
  headless: true,
  // slowMo: 500,
  defaultViewport: null,
};

const __filename = fileURLToPath(import.meta.url);
const downloadPath = path.join(path.dirname(__filename), "temp");

const crawl = async () => {
  const browser = await puppeteer.launch(options);
  const page = await browser.newPage();
  const cdpSession = await page.target().createCDPSession();
  await cdpSession.send("Browser.setDownloadBehavior", {
    behavior: "allow",
    downloadPath,
    eventsEnabled: true,
  });

  const downloaded = new Promise((resolve, reject) => {
    cdpSession.on("Browser.downloadProgress", (params) => {
      if (params.state == "completed") {
        console.log("download completed");
        resolve();
      } else if (params.state == "canceled") {
        console.log("canceled");
        reject("download cancelled");
      }
    });
  });

  await page.goto(process.env.CHOFU_LIB_RENTAL_LIST_URL);
  await page.evaluate((process) => {
    document.getElementById("textUserId").value = process.env.CHOFU_LIB_USER_ID;
    document.getElementById("textPassword").value =
      process.env.CHOFU_LIB_PASSWORD;
    document.getElementById("buttonLogin").click();
  }, process);

  await page.waitForNavigation();

  await page.goto(process.env.CHOFU_LIB_RENTAL_LIST_URL);
  await page.waitForSelector('button[name="buttonCsv"]');
  await page.click('button[name="buttonCsv"]');

  await Promise.race([
    downloaded,
    new Promise((_resolve, reject) => {
      setTimeout(() => {
        reject("download timed out");
      }, 1000);
    }),
  ]);

  await browser.close();
};

(async () => {
  await crawl();
})();
