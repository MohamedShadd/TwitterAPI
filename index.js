import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import express from "express";
import dotenv from "dotenv";
import {initializeBrowser} from "./functions/initializeBrowser.js";
import {setupPage} from "./functions/setupPage.js";
import {handleLogin} from "./functions/handleLogin.js";
import {collectTweets} from "./functions/collectTweets.js";

dotenv.config();


puppeteer.use(StealthPlugin());

const PORT = process.env.PORT || 10000;
const app = express();


app.get("/fetchTweets", async (req, res) => {
  const targetProfile = req.query.targetProfile
  let browser;
  try {
    browser = await initializeBrowser();
    const page = await setupPage(browser, targetProfile);
    await handleLogin(page);
    const allTweets = await collectTweets(page, targetProfile);
    res.json({tweets: allTweets});
  } catch (error) {
    console.error("Error fetching tweets:", error);
    res.status(500).json({error: "Failed to fetch tweets."});
  } finally {
    if (browser) await browser.close();
  }
});

app.get("/", async (req, res) => {
  res.status(201).json({ message: "Server online" });
});

app.listen(PORT, () => console.log(`API running on port ${PORT}`));
